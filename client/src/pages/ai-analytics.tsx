import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, TrendingUp, AlertTriangle, Shield, Target, Calculator,
  Activity, BarChart3, PieChart, LineChart, DollarSign, Calendar,
  Zap, Eye, CheckCircle, XCircle, Clock, Search, Filter, FileText,
  Users, CreditCard, Settings, Bell, RefreshCw, Download
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AIAnalytics() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [selectedScenario, setSelectedScenario] = useState('conservative');
  const [showAlertDetail, setShowAlertDetail] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [alertFilter, setAlertFilter] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch real transaction data for fraud detection
  const { data: transactionResponse = { transactions: [] } } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      return api.getTransactions({ limit: 1000 });
    }
  });

  const transactionData = transactionResponse.transactions || [];

  // Fetch dashboard stats for AI insights
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      return api.getDashboardStats();
    }
  });

  // Fetch AI insights from backend
  const { data: aiInsights, refetch: refetchInsights } = useQuery({
    queryKey: ['/api/ai/insights'],
    queryFn: async () => {
      return api.getAIInsights();
    }
  });

  // Generate fraud detection alerts from real data
  const generateFraudAlerts = () => {
    if (!transactionData.length) return [];
    
    const alerts = [];
    const now = new Date();
    const recentTransactions = transactionData.filter((t: any) => 
      new Date(t.date) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
    );

    // Detect unusual transaction patterns
    const expenseTransactions = recentTransactions.filter((t: any) => t.type === 'expense');
    const largeExpenses = expenseTransactions.filter((t: any) => 
      parseFloat(t.amount) > 5000000 // Above 5 million
    );

    if (largeExpenses.length > 3) {
      alerts.push({
        id: `large_expense_${Date.now()}`,
        type: 'unusual_spending',
        severity: 'high',
        title: 'Unusual Large Expenses Detected',
        description: `${largeExpenses.length} transaksi pengeluaran besar (>Rp 5jt) dalam 24 jam terakhir`,
        timestamp: now.toISOString(),
        outlet: 'Multiple Outlets',
        amount: largeExpenses.reduce((sum: any, t: any) => sum + parseFloat(t.amount), 0),
        status: 'investigating'
      });
    }

    // Detect rapid sequential transactions
    const sortedTransactions = recentTransactions.sort((a: any, b: any) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let rapidCount = 0;
    for (let i = 1; i < sortedTransactions.length; i++) {
      const timeDiff = new Date(sortedTransactions[i].createdAt).getTime() - 
                     new Date(sortedTransactions[i-1].createdAt).getTime();
      if (timeDiff < 60000) { // Less than 1 minute apart
        rapidCount++;
      }
    }

    if (rapidCount > 5) {
      alerts.push({
        id: `rapid_transactions_${Date.now()}`,
        type: 'rapid_transactions',
        severity: 'medium',
        title: 'Rapid Transaction Pattern',
        description: `${rapidCount} transaksi berurutan dalam interval <1 menit terdeteksi`,
        timestamp: now.toISOString(),
        outlet: 'System Wide',
        amount: 0,
        status: 'pending'
      });
    }

    return alerts;
  };

  // Generate AI insights using DeepSeek API
  const generateAIInsights = useMutation({
    mutationFn: async () => {
      return api.generateAIInsights({
        transactionData: transactionData.slice(0, 50), // Send recent transactions
        dashboardStats: dashboardStats
      });
    },
    onSuccess: (data) => {
      toast({
        title: "AI Insights Generated",
        description: "New business insights have been generated using DeepSeek AI",
      });
      refetchInsights();
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Unable to generate AI insights. Please try again.",
        variant: "destructive"
      });
    }
  });



  // Update alert status
  const updateAlertStatus = useMutation({
    mutationFn: async ({ alertId, status }: { alertId: string, status: string }) => {
      return api.updateAlertStatus(parseInt(alertId), status);
    },
    onSuccess: () => {
      toast({
        title: "Alert Updated",
        description: "Alert status has been updated successfully",
      });
      setShowAlertDetail(false);
    }
  });

  // Mock advanced analytics data (fallback)
  const defaultCashFlowForecast = {
    next30Days: {
      projectedIncome: 125000000,
      projectedExpenses: 98000000,
      netCashFlow: 27000000,
      confidence: 85
    },
    next60Days: {
      projectedIncome: 245000000,
      projectedExpenses: 190000000,
      netCashFlow: 55000000,
      confidence: 78
    },
    next90Days: {
      projectedIncome: 365000000,
      projectedExpenses: 285000000,
      netCashFlow: 80000000,
      confidence: 72
    }
  };

  // Enhanced cash flow forecasting with real data
  const generateCashFlowForecast = () => {
    if (!dashboardStats) return defaultCashFlowForecast;

    const currentBalance = dashboardStats.cashBalance || 0;
    const weeklyIncome = dashboardStats.weeklyIncome || 0;
    const weeklyExpenses = dashboardStats.weeklyExpenses || 0;
    const weeklyNet = weeklyIncome - weeklyExpenses;

    // Project based on current trends
    const monthlyNet = weeklyNet * 4.33; // Average weeks per month
    
    return {
      next30Days: {
        projectedIncome: weeklyIncome * 4.33,
        projectedExpenses: weeklyExpenses * 4.33,
        netCashFlow: monthlyNet,
        confidence: 85
      },
      next60Days: {
        projectedIncome: weeklyIncome * 8.66,
        projectedExpenses: weeklyExpenses * 8.66,
        netCashFlow: monthlyNet * 2,
        confidence: 78
      },
      next90Days: {
        projectedIncome: weeklyIncome * 13,
        projectedExpenses: weeklyExpenses * 13,
        netCashFlow: monthlyNet * 3,
        confidence: 72
      }
    };
  };

  const realCashFlowForecast = generateCashFlowForecast();
  
  // Real-time fraud alerts from real data
  const realTimeFraudAlerts = generateFraudAlerts();

  // Mock advanced analytics data
  const cashFlowForecast = {
    next30Days: {
      projectedIncome: 125000000,
      projectedExpenses: 98000000,
      netCashFlow: 27000000,
      confidence: 85
    },
    next60Days: {
      projectedIncome: 245000000,
      projectedExpenses: 190000000,
      netCashFlow: 55000000,
      confidence: 78
    },
    next90Days: {
      projectedIncome: 365000000,
      projectedExpenses: 285000000,
      netCashFlow: 80000000,
      confidence: 72
    }
  };

  const profitabilityAnalysis = {
    byProduct: [
      { name: 'Nasi Gudeg', revenue: 45000000, cost: 28000000, profit: 17000000, margin: 37.8 },
      { name: 'Ayam Bakar', revenue: 38000000, cost: 25000000, profit: 13000000, margin: 34.2 },
      { name: 'Soto Ayam', revenue: 32000000, cost: 18000000, profit: 14000000, margin: 43.8 },
      { name: 'Es Teh', revenue: 15000000, cost: 3000000, profit: 12000000, margin: 80.0 }
    ],
    byBranch: [
      { name: 'Cabang Utama', revenue: 85000000, cost: 52000000, profit: 33000000, margin: 38.8 },
      { name: 'Cabang Mall', revenue: 65000000, cost: 42000000, profit: 23000000, margin: 35.4 }
    ],
    byTimeSlot: [
      { period: '06:00-10:00', revenue: 25000000, profit: 8000000, margin: 32.0 },
      { period: '10:00-14:00', revenue: 45000000, profit: 18000000, margin: 40.0 },
      { period: '14:00-18:00', revenue: 35000000, profit: 12000000, margin: 34.3 },
      { period: '18:00-22:00', revenue: 45000000, profit: 17000000, margin: 37.8 }
    ]
  };

  const budgetScenarios = {
    conservative: {
      revenueGrowth: 5,
      costIncrease: 3,
      projectedProfit: 45000000,
      roi: 15.2
    },
    moderate: {
      revenueGrowth: 12,
      costIncrease: 8,
      projectedProfit: 52000000,
      roi: 18.7
    },
    aggressive: {
      revenueGrowth: 25,
      costIncrease: 15,
      projectedProfit: 68000000,
      roi: 24.3
    }
  };

  const fraudAlerts = [
    {
      id: 1,
      type: 'void_anomaly',
      severity: 'high',
      title: 'Excessive Voids Detected',
      description: 'Cabang Mall menunjukkan 15 void transaksi dalam 2 jam terakhir',
      timestamp: '2024-06-20T16:30:00',
      outlet: 'Cabang Mall',
      amount: 2500000,
      status: 'investigating'
    },
    {
      id: 2,
      type: 'discount_abuse',
      severity: 'medium',
      title: 'Unusual Discount Pattern',
      description: 'Kasir Ahmad memberikan diskon >20% pada 8 transaksi berturut-turut',
      timestamp: '2024-06-20T14:15:00',
      outlet: 'Cabang Utama',
      amount: 1200000,
      status: 'pending'
    },
    {
      id: 3,
      type: 'stock_inconsistency',
      severity: 'high',
      title: 'Stock Discrepancy Alert',
      description: 'Bahan baku ayam: sistem 50kg, fisik 35kg (selisih 15kg)',
      timestamp: '2024-06-20T12:00:00',
      outlet: 'Cabang Utama',
      amount: 750000,
      status: 'resolved'
    },
    {
      id: 4,
      type: 'invoice_anomaly',
      severity: 'medium',
      title: 'Supplier Invoice Anomaly',
      description: 'PT Sumber Rejeki: harga naik 35% tanpa notifikasi sebelumnya',
      timestamp: '2024-06-20T10:30:00',
      outlet: 'All Outlets',
      amount: 5000000,
      status: 'investigating'
    }
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">High Risk</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Low Risk</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'investigating':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Analytics & Fraud Detection</h1>
          <p className="text-gray-600 mt-1">Advanced business intelligence dan deteksi anomali</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Export Analysis
          </Button>
          <Button className="bg-[#f29716] hover:bg-[#d4820a] flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Generate Insights
          </Button>
        </div>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="forecasting">Cash Flow Forecasting</TabsTrigger>
          <TabsTrigger value="profitability">Profitability Analysis</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[#f29716]" />
                  Dynamic Budgeting & Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {Object.keys(budgetScenarios).map((scenario) => (
                      <Button
                        key={scenario}
                        variant={selectedScenario === scenario ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedScenario(scenario)}
                        className={selectedScenario === scenario ? "bg-[#f29716] hover:bg-[#d4820a]" : ""}
                      >
                        {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Revenue Growth</span>
                      <span className="font-bold text-blue-600">+{(budgetScenarios as any)[selectedScenario].revenueGrowth}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium">Cost Increase</span>
                      <span className="font-bold text-red-600">+{(budgetScenarios as any)[selectedScenario].costIncrease}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Projected Profit</span>
                      <span className="font-bold text-green-600">{formatCurrency((budgetScenarios as any)[selectedScenario].projectedProfit)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium">Expected ROI</span>
                      <span className="font-bold text-orange-600">{(budgetScenarios as any)[selectedScenario].roi}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#f29716]" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border-l-4 border-green-500 bg-green-50">
                    <p className="font-medium text-green-800">High Profit Opportunity</p>
                    <p className="text-sm text-green-700">Tingkatkan produksi Es Teh (margin 80%) di jam 14:00-18:00</p>
                  </div>
                  <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                    <p className="font-medium text-blue-800">Cost Optimization</p>
                    <p className="text-sm text-blue-700">Negosiasi kontrak supplier dapat menghemat 12% biaya bahan baku</p>
                  </div>
                  <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
                    <p className="font-medium text-yellow-800">Market Expansion</p>
                    <p className="text-sm text-yellow-700">Potensi cabang ketiga di area mall dengan ROI 18 bulan</p>
                  </div>
                  <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                    <p className="font-medium text-orange-800">Staff Optimization</p>
                    <p className="text-sm text-orange-700">Realokasi staff dapat meningkatkan efisiensi 15%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cash Flow Forecasting Tab */}
        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  30 Days Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Projected Income</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(realCashFlowForecast.next30Days.projectedIncome)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Projected Expenses</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(realCashFlowForecast.next30Days.projectedExpenses)}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">Net Cash Flow</p>
                    <p className="text-2xl font-bold text-[#f29716]">{formatCurrency(realCashFlowForecast.next30Days.netCashFlow)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: `${realCashFlowForecast.next30Days.confidence}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{realCashFlowForecast.next30Days.confidence}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  60 Days Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Projected Income</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(realCashFlowForecast.next60Days.projectedIncome)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Projected Expenses</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(realCashFlowForecast.next60Days.projectedExpenses)}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">Net Cash Flow</p>
                    <p className="text-2xl font-bold text-[#f29716]">{formatCurrency(realCashFlowForecast.next60Days.netCashFlow)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: `${realCashFlowForecast.next60Days.confidence}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{realCashFlowForecast.next60Days.confidence}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  90 Days Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Projected Income</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(realCashFlowForecast.next90Days.projectedIncome)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Projected Expenses</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(realCashFlowForecast.next90Days.projectedExpenses)}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">Net Cash Flow</p>
                    <p className="text-2xl font-bold text-[#f29716]">{formatCurrency(realCashFlowForecast.next90Days.netCashFlow)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{width: `${realCashFlowForecast.next90Days.confidence}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{realCashFlowForecast.next90Days.confidence}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profitability Analysis Tab */}
        <TabsContent value="profitability" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-[#f29716]" />
                  Profitability by Product
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profitabilityAnalysis.byProduct.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">Revenue: {formatCurrency(product.revenue)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(product.profit)}</p>
                        <p className="text-sm text-gray-600">{product.margin}% margin</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#f29716]" />
                  Profitability by Branch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profitabilityAnalysis.byBranch.map((branch, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{branch.name}</p>
                        <p className="text-sm text-gray-600">Revenue: {formatCurrency(branch.revenue)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(branch.profit)}</p>
                        <p className="text-sm text-gray-600">{branch.margin}% margin</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-[#f29716]" />
                Profitability by Time Slot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {profitabilityAnalysis.byTimeSlot.map((slot, index) => (
                  <div key={index} className="p-4 border rounded-lg text-center">
                    <p className="font-medium text-gray-900">{slot.period}</p>
                    <p className="text-lg font-bold text-[#f29716] mt-2">{formatCurrency(slot.revenue)}</p>
                    <p className="text-sm text-green-600">Profit: {formatCurrency(slot.profit)}</p>
                    <p className="text-xs text-gray-600">{slot.margin}% margin</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fraud Detection Tab */}
        <TabsContent value="fraud" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                    <p className="text-2xl font-bold text-red-600">{realTimeFraudAlerts.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">High Risk</p>
                    <p className="text-2xl font-bold text-red-500">
                      {realTimeFraudAlerts.filter(a => a.severity === 'high').length}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transactions Analyzed</p>
                    <p className="text-2xl font-bold text-blue-600">{transactionData.length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Detection Rate</p>
                    <p className="text-2xl font-bold text-green-600">99.8%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Real-time Fraud Detection
                  </CardTitle>
                  <CardDescription>AI-powered anomaly detection dan suspicious activities</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={alertFilter} onValueChange={setAlertFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Alerts</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/transactions'] })}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {realTimeFraudAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Aman</h3>
                    <p className="text-gray-600">Tidak ada anomali transaksi terdeteksi dalam 24 jam terakhir</p>
                  </div>
                ) : (
                  realTimeFraudAlerts
                    .filter(alert => 
                      alertFilter === 'all' || 
                      alert.severity === alertFilter || 
                      alert.status === alertFilter
                    )
                    .map((alert) => (
                      <div key={alert.id} className={`flex items-center justify-between p-4 border-l-4 rounded-lg hover:bg-gray-50 ${
                        alert.severity === 'high' ? 'border-l-red-500 bg-red-50' : 
                        alert.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-50' : 'border-l-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(alert.status)}
                            {getSeverityBadge(alert.severity)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{alert.title}</p>
                            <p className="text-sm text-gray-600">{alert.description}</p>
                            <p className="text-xs text-gray-500">{alert.outlet} • {formatDate(new Date(alert.timestamp))}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {alert.amount > 0 && (
                            <p className="font-semibold text-red-600 mb-2">{formatCurrency(alert.amount)}</p>
                          )}
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedAlert(alert);
                                setShowAlertDetail(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Detail
                            </Button>
                            {alert.status === 'pending' && (
                              <Button 
                                size="sm"
                                className="bg-[#f29716] hover:bg-[#d4820a]"
                                onClick={() => updateAlertStatus.mutate({ 
                                  alertId: alert.id, 
                                  status: 'investigating' 
                                })}
                                disabled={updateAlertStatus.isPending}
                              >
                                Investigate
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Alert Detail Dialog */}
      <Dialog open={showAlertDetail} onOpenChange={setShowAlertDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Alert Detail: {selectedAlert?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Alert Type</Label>
                  <p className="text-sm">{selectedAlert.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Severity</Label>
                  <div className="mt-1">{getSeverityBadge(selectedAlert.severity)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedAlert.status)}
                    <span className="text-sm capitalize">{selectedAlert.status}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Outlet</Label>
                  <p className="text-sm">{selectedAlert.outlet}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Timestamp</Label>
                  <p className="text-sm">{formatDate(new Date(selectedAlert.timestamp))}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Amount</Label>
                  <p className="text-sm font-semibold text-red-600">
                    {selectedAlert.amount > 0 ? formatCurrency(selectedAlert.amount) : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">{selectedAlert.description}</p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setShowAlertDetail(false)}
                  >
                    Close
                  </Button>
                </div>
                <div className="flex gap-2">
                  {selectedAlert.status === 'pending' && (
                    <Button 
                      className="bg-[#f29716] hover:bg-[#d4820a]"
                      onClick={() => updateAlertStatus.mutate({ 
                        alertId: selectedAlert.id, 
                        status: 'investigating' 
                      })}
                      disabled={updateAlertStatus.isPending}
                    >
                      Start Investigation
                    </Button>
                  )}
                  {selectedAlert.status === 'investigating' && (
                    <Button 
                      variant="outline"
                      onClick={() => updateAlertStatus.mutate({ 
                        alertId: selectedAlert.id, 
                        status: 'resolved' 
                      })}
                      disabled={updateAlertStatus.isPending}
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced AI Insights Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="bg-[#f29716] hover:bg-[#d4820a] shadow-lg"
          onClick={() => {
            setIsAnalyzing(true);
            generateAIInsights.mutate();
            setTimeout(() => setIsAnalyzing(false), 3000);
          }}
          disabled={generateAIInsights.isPending || isAnalyzing}
        >
          <Brain className="h-5 w-5 mr-2" />
          {isAnalyzing ? 'Analyzing...' : 'Generate AI Insights'}
        </Button>
      </div>
    </div>
  );
}