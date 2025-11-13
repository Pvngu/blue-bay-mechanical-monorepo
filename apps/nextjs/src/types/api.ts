export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface DashboardStats {
  todaysJobs: number;
  activeTechnicians: number;
  revenue: number;
  completionRate: number;
}

export interface ActiveJob {
  id: string;
  work_order_number: string;
  title: string;
  client_name: string;
  technician_name: string;
  status: string;
  priority: string;
  scheduled_date: string;
}

export interface RecentCompletion {
  id: string;
  work_order_number: string;
  title: string;
  client_name: string;
  technician_name: string;
  completed_date: string;
  total_cost: number;
}

export interface RevenueOverTime {
  month: string;
  revenue: number;
}

export interface JobStatusDistribution {
  status: string;
  count: number;
}

export interface TopTechnician {
  name: string;
  completed_jobs: number;
}

export interface DashboardCharts {
  revenueOverTime: RevenueOverTime[];
  jobStatusDistribution: JobStatusDistribution[];
  topTechnicians: TopTechnician[];
}

export interface DashboardData {
  stats: DashboardStats;
  activeJobs: ActiveJob[];
  recentCompletions: RecentCompletion[];
  charts: DashboardCharts;
}

export interface BillingLineItem {
  id: string;
  billing_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type?: string | null;
}

export interface Billing {
  id: string;
  invoice_number: string;
  client_id: number;
  work_order_id?: string | null;
  job_id?: string | null;
  invoice_type: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  payment_method?: string | null;
  payment_date?: string | null;
  notes?: string | null;
  terms_conditions?: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    id: number;
    name: string;
  };
  work_order?: {
    id: string;
    work_order_number: string;
  };
  line_items?: BillingLineItem[];
}

export interface BillingStats {
  total_revenue: number;
  pending_amount: number;
  total_documents: number;
  paid_invoices: number;
  overdue_invoices: number;
}

export interface Notification {
  id: string;
  user_id?: number | null;
  client_id?: number | null;
  notification_type: string;
  subject?: string | null;
  message: string;
  status: 'pending' | 'scheduled' | 'sent' | 'failed' | 'read';
  scheduled_for?: string | null;
  sent_at?: string | null;
  read_at?: string | null;
  related_job_id?: string | null;
  related_work_order_id?: string | null;
  metadata?: any;
  created_at: string;
  updated_at: string;
}