import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, TrendingUp, AlertTriangle, Shield, Target, Calculator,
  Activity, BarChart3, PieChart, LineChart, DollarSign, Calendar,
  Zap, Eye, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { api } from '@/lib/api';

export default function AIAnalytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [selectedScenario, setSelectedScenario] = useState('conservative');

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
                    <p className="text-xl font-bold text-green-600">{formatCurrency(cashFlowForecast.next30Days.projectedIncome)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Projected Expenses</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(cashFlowForecast.next30Days.projectedExpenses)}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">Net Cash Flow</p>
                    <p className="text-2xl font-bold text-[#f29716]">{formatCurrency(cashFlowForecast.next30Days.netCashFlow)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: `${cashFlowForecast.next30Days.confidence}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{cashFlowForecast.next30Days.confidence}%</span>
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
                    <p className="text-xl font-bold text-green-600">{formatCurrency(cashFlowForecast.next60Days.projectedIncome)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Projected Expenses</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(cashFlowForecast.next60Days.projectedExpenses)}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">Net Cash Flow</p>
                    <p className="text-2xl font-bold text-[#f29716]">{formatCurrency(cashFlowForecast.next60Days.netCashFlow)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: `${cashFlowForecast.next60Days.confidence}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{cashFlowForecast.next60Days.confidence}%</span>
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
                    <p className="text-xl font-bold text-green-600">{formatCurrency(cashFlowForecast.next90Days.projectedIncome)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Projected Expenses</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(cashFlowForecast.next90Days.projectedExpenses)}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">Net Cash Flow</p>
                    <p className="text-2xl font-bold text-[#f29716]">{formatCurrency(cashFlowForecast.next90Days.netCashFlow)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{width: `${cashFlowForecast.next90Days.confidence}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{cashFlowForecast.next90Days.confidence}%</span>
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
                    <p className="text-2xl font-bold text-red-600">4</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                    <p className="text-2xl font-bold text-green-600">12</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Risk Score</p>
                    <p className="text-2xl font-bold text-yellow-600">Medium</p>
                  </div>
                  <Shield className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Savings This Month</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(8500000)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Fraud Detection Alerts
              </CardTitle>
              <CardDescription>Real-time anomaly detection dan suspicious activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fraudAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(alert.status)}
                        {getSeverityBadge(alert.severity)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{alert.title}</p>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                        <p className="text-xs text-gray-500">{alert.outlet} • {formatDate(alert.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">{formatCurrency(alert.amount)}</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Investigate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}