/**
 * Dashboard Data Hook
 * Isolated data fetching for dashboard metrics with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { DashboardMetrics, UseDashboardDataResult } from '../types';

// Mock data for initial implementation
const generateMockData = (): DashboardMetrics => ({
  totalRevenue: Math.floor(Math.random() * 100000) + 50000,
  totalOrders: Math.floor(Math.random() * 1000) + 200,
  averageOrderValue: Math.floor(Math.random() * 200) + 50,
  activeUsers: Math.floor(Math.random() * 500) + 100,
  ordersProcessed: 247 // Static for now as in original
});

export const useDashboardData = (refreshInterval: number = 30000): UseDashboardDataResult => {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // TODO: Replace with actual Supabase queries
      // const { data: orderData } = await supabase
      //   .from('orders')
      //   .select('COUNT(*) as count, SUM(amount) as revenue');
      // 
      // const { data: customerData } = await supabase
      //   .from('customers')
      //   .select('COUNT(*) as count');

      // For now, use mock data
      const mockData = generateMockData();
      setData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

// Additional hook for specific metrics
export const useKPIMetrics = () => {
  const { data, loading, error, refetch } = useDashboardData();

  const formatMetrics = useCallback(() => {
    if (!data) return [];

    return [
      {
        id: 'total-revenue',
        title: 'Total Revenue',
        value: data.totalRevenue,
        suffix: '',
        description: 'From orders table',
        delta: '+12.3%',
        deltaType: 'increase' as const
      },
      {
        id: 'active-users',
        title: 'Active Users',
        value: data.activeUsers,
        suffix: '',
        description: 'From customers table',
        delta: '+5.1%',
        deltaType: 'increase' as const
      },
      {
        id: 'orders-processed',
        title: 'Orders Processed',
        value: data.ordersProcessed,
        suffix: '',
        description: 'This month'
      },
      {
        id: 'average-order-value',
        title: 'Avg Order Value',
        value: `$${data.averageOrderValue}`,
        suffix: '',
        description: 'Per transaction',
        delta: '+2.1%',
        deltaType: 'increase' as const
      }
    ];
  }, [data]);

  return {
    metrics: formatMetrics(),
    loading,
    error,
    refetch
  };
};