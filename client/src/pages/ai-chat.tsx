import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, Send, Bot, User, Trash2, Copy, ThumbsUp, ThumbsDown,
  TrendingUp, BarChart3, Calculator, DollarSign, Calendar, RefreshCw
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export default function AIChat() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Halo! Saya asisten AI DeepSeek untuk analisis data bisnis Anda. Tanyakan apa saja tentang transaksi, penjualan, pengeluaran, atau insight bisnis lainnya.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch transaction data for AI context
  const { data: transactionResponse = { transactions: [] } } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      return api.getTransactions({ limit: 1000 });
    }
  });

  const transactionData = transactionResponse.transactions || [];

  // Fetch dashboard stats for AI context
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      return api.getDashboardStats();
    }
  });

  // Fetch outlets data for AI context
  const { data: outletsData = [] } = useQuery({
    queryKey: ['/api/outlets'],
    queryFn: async () => {
      return api.getOutlets();
    }
  });

  // AI Chat mutation using DeepSeek API
  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      return api.sendChatMessage({
        message: userMessage,
        context: {
          transactions: transactionData.slice(0, 50), // Recent transactions for context
          dashboardStats: dashboardStats,
          outlets: outletsData,
          businessName: 'Toko Berkah'
        }
      });
    },
    onSuccess: (data) => {
      setIsTyping(false);
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => prev.map(msg => 
        msg.isTyping ? aiMessage : msg
      ));
    },
    onError: (error) => {
      setIsTyping(false);
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      toast({
        title: "Chat Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      type: 'ai',
      content: 'AI sedang menganalisis data...',
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, userMessage, typingMessage]);
    setIsTyping(true);
    
    // Send to AI
    sendMessageMutation.mutate(inputMessage);
    setInputMessage('');
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: 'Halo! Saya asisten AI DeepSeek untuk analisis data bisnis Anda. Tanyakan apa saja tentang transaksi, penjualan, pengeluaran, atau insight bisnis lainnya.',
        timestamp: new Date()
      }
    ]);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  // Quick question suggestions
  const quickQuestions = [
    "Apa transaksi terbesar bulan ini?",
    "Berapa total penjualan minggu ini?",
    "Outlet mana yang paling menguntungkan?",
    "Kategori pengeluaran apa yang tertinggi?",
    "Bagaimana trend penjualan 30 hari terakhir?",
    "Prediksi cash flow bulan depan?",
    "Berapa rata-rata transaksi harian?",
    "Rekomendasi untuk meningkatkan profit?"
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Chat Assistant</h1>
          <p className="text-gray-600 mt-2">Tanyakan apa saja tentang data bisnis Anda kepada DeepSeek AI</p>
        </div>
        <Button 
          onClick={clearChat}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear Chat
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionData.length}</div>
            <p className="text-xs text-gray-600">Data tersedia untuk AI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Kas</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardStats?.cashBalance || 0)}</div>
            <p className="text-xs text-gray-600">Real-time balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardStats?.weeklyIncome || 0)}</div>
            <p className="text-xs text-gray-600">7 hari terakhir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outlets</CardTitle>
            <Calculator className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outletsData.length}</div>
            <p className="text-xs text-gray-600">Cabang aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pertanyaan Cepat</CardTitle>
          <CardDescription>Klik untuk bertanya langsung kepada AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-colors"
                onClick={() => setInputMessage(question)}
              >
                {question}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-orange-500" />
            Chat dengan DeepSeek AI
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          {/* Messages Area */}
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`p-2 rounded-full ${
                      message.type === 'user' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.isTyping ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>{message.content}</span>
                        </div>
                      ) : (
                        <div>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span className={`text-xs ${
                              message.type === 'user' ? 'text-orange-100' : 'text-gray-500'
                            }`}>
                              {formatDate(message.timestamp)}
                            </span>
                            {message.type === 'ai' && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyMessage(message.content)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tanyakan tentang data bisnis Anda..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isTyping}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}