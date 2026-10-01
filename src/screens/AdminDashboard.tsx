// ─────────────────────────────────────────────────────────────
// LocalFix MSDE Intelligence Portal — Admin Dashboard
// ─────────────────────────────────────────────────────────────
// Premium enterprise analytics dashboard for government labour
// market planners.  Designed for web; chart rendering is gated
// behind a Platform.OS === 'web' check so native builds are safe.
// ─────────────────────────────────────────────────────────────

import {
  AlertTriangle,
  BarChart2 as ChartIcon,
  CheckCircle,
  FileDown,
  LayoutDashboard,
  MapPin,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Copy, Heading } from '../components/ui';
import {
  earlyWarnings,
  summaryStats,
  supplyDemandData,
  type EarlyWarning,
  type SummaryStat,
} from '../data/dummyData';

// ── Conditional recharts import (web only) ──────────────────
// recharts is a DOM-based library. On native it won't render,
// so we only import and use it when Platform.OS === 'web'.
let RCBarChart: any;
let RCBar: any;
let RCXAxis: any;
let RCYAxis: any;
let RCCartesianGrid: any;
let RCTooltip: any;
let RCLegend: any;
let RCResponsiveContainer: any;

if (Platform.OS === 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rc = require('recharts');
  RCBarChart = rc.BarChart;
  RCBar = rc.Bar;
  RCXAxis = rc.XAxis;
  RCYAxis = rc.YAxis;
  RCCartesianGrid = rc.CartesianGrid;
  RCTooltip = rc.Tooltip;
  RCLegend = rc.Legend;
  RCResponsiveContainer = rc.ResponsiveContainer;
}

// ── Constants ───────────────────────────────────────────────

type NavId = 'overview' | 'forecasts' | 'district' | 'export';

interface NavItem {
  id: NavId;
  label: string;
  Icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'forecasts', label: 'Forecasts', Icon: ChartIcon },
  { id: 'district', label: 'District Map', Icon: MapPin },
  { id: 'export', label: 'Export to MSDE', Icon: FileDown },
];

const STAT_ICONS: LucideIcon[] = [Users, CheckCircle, TrendingUp];
const STAT_COLORS = ['#3B82F6', '#16A34A', '#F59E0B'] as const;
const STAT_BGS = ['#EFF6FF', '#F0FDF4', '#FFFBEB'] as const;

// ── Sub-components ──────────────────────────────────────────

function SidebarLink({
  item,
  active,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  onPress: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      className={`mx-2 mb-0.5 flex-row items-center gap-3 rounded-lg px-3 py-2.5 ${
        active ? 'bg-mint' : hover ? 'bg-canvas' : ''
      }`}
    >
      <item.Icon size={18} color={active ? '#287454' : '#7A8981'} />
      <Copy
        className={`text-[13px] ${
          active ? 'font-bold text-primary' : 'text-muted'
        }`}
      >
        {item.label}
      </Copy>
    </Pressable>
  );
}

function StatCard({ stat, index }: { stat: SummaryStat; index: number }) {
  const Icon = STAT_ICONS[index]!;
  const color = STAT_COLORS[index]!;
  const bg = STAT_BGS[index]!;
  const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <View className="min-w-[220px] flex-1 rounded-xl border border-line bg-white p-4 md:p-5">
      <View className="flex-row items-center justify-between">
        <View
          style={{ backgroundColor: bg }}
          className="h-10 w-10 items-center justify-center rounded-lg md:h-11 md:w-11"
        >
          <Icon size={20} color={color} />
        </View>
        <View className="flex-row items-center gap-1 rounded-full bg-canvas px-2 py-0.5">
          <TrendIcon size={13} color={stat.trend === 'up' ? '#16A34A' : '#DC2626'} />
          <Text
            className={`font-semibold text-[11px] ${
              stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {stat.change}%
          </Text>
        </View>
      </View>

      <Text className="mt-3 font-displaybold text-[26px] text-ink md:text-[30px]">
        {stat.value}
      </Text>
      <Copy className="mt-0.5 font-semibold text-[13px] text-ink">{stat.label}</Copy>
      <Copy className="text-[11px] text-muted">{stat.subtext}</Copy>
    </View>
  );
}

function WarningCard({ warning }: { warning: EarlyWarning }) {
  const isRed = warning.severity === 'red';
  return (
    <View
      style={{
        borderLeftWidth: 4,
        borderLeftColor: isRed ? '#DC2626' : '#16A34A',
      }}
      className={`rounded-lg p-3 md:p-3.5 ${isRed ? 'bg-rose' : 'bg-[#F0FDF4]'}`}
    >
      <View className="flex-row items-center gap-2">
        {isRed ? (
          <AlertTriangle size={14} color="#DC2626" />
        ) : (
          <Zap size={14} color="#16A34A" />
        )}
        <Text
          className={`font-bold text-[13px] ${
            isRed ? 'text-red-800' : 'text-green-800'
          }`}
        >
          {warning.trade} — {isRed ? 'Oversupply' : 'Shortage'}
        </Text>
      </View>
      <Copy className="mt-1.5 text-[12px] leading-[18px] text-ink">
        {warning.recommendation}
      </Copy>
    </View>
  );
}

function SupplyDemandChart() {
  if (Platform.OS !== 'web') {
    return (
      <View className="h-72 items-center justify-center rounded-lg bg-canvas">
        <Copy className="text-muted">Charts are available on the web dashboard.</Copy>
      </View>
    );
  }

  return (
    <View style={{ height: 340 }}>
      <RCResponsiveContainer width="100%" height="100%">
        <RCBarChart data={supplyDemandData} barGap={6} barCategoryGap="20%">
          <RCCartesianGrid
            strokeDasharray="3 3"
            stroke="#E4EBE6"
            vertical={false}
          />
          <RCXAxis
            dataKey="trade"
            tick={{ fontSize: 12, fill: '#7A8981', fontFamily: 'DMSans_400Regular, sans-serif' }}
            axisLine={{ stroke: '#E4EBE6' }}
            tickLine={false}
          />
          <RCYAxis
            tick={{ fontSize: 12, fill: '#7A8981', fontFamily: 'DMSans_400Regular, sans-serif' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
            }
          />
          <RCTooltip
            contentStyle={{
              borderRadius: 10,
              border: '1px solid #E4EBE6',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontFamily: 'DMSans_400Regular, sans-serif',
              fontSize: 13,
              padding: '10px 14px',
            }}
            cursor={{ fill: 'rgba(40, 116, 84, 0.04)' }}
          />
          <RCLegend
            wrapperStyle={{
              fontSize: 13,
              paddingTop: 16,
              fontFamily: 'DMSans_400Regular, sans-serif',
            }}
          />
          <RCBar
            dataKey="currentSupply"
            name="Current Supply"
            fill="#3B82F6"
            radius={[6, 6, 0, 0]}
          />
          <RCBar
            dataKey="projectedDemand"
            name="Projected Demand"
            fill="#8B5CF6"
            radius={[6, 6, 0, 0]}
          />
        </RCBarChart>
      </RCResponsiveContainer>
    </View>
  );
}

// ── Main Dashboard ──────────────────────────────────────────

export function AdminDashboard({ onBack }: { onBack?: () => void }) {
  const { width } = useWindowDimensions();
  const showSidebar = width >= 900;
  const showSearch = width >= 640;
  const [activeNav, setActiveNav] = useState<NavId>('overview');

  return (
    <View className="flex-1 bg-canvas">
      {/* ── Header ── */}
      <View className="h-[60px] flex-row items-center justify-between border-b border-line bg-white px-4 md:px-6">
        <View className="flex-row items-center gap-3">
          {onBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={onBack}
              className="mr-1 h-9 w-9 items-center justify-center rounded-lg bg-canvas"
            >
              <Text className="text-[16px] text-muted">←</Text>
            </Pressable>
          )}
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard size={17} color="white" />
          </View>
          <Text className="font-displaybold text-[15px] text-ink md:text-[17px]">
            LocalFix{' '}
            <Text className="text-primary">MSDE</Text>{' '}
            Intelligence Portal
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          {showSearch && (
            <View className="flex-row items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2">
              <Search size={14} color="#96A19B" />
              <TextInput
                placeholder="Search trades, districts…"
                placeholderTextColor="#96A19B"
                className="w-44 font-sans text-[13px] text-ink md:w-52"
              />
            </View>
          )}
          {/* Profile avatar */}
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
              <Text className="font-bold text-[13px] text-white">SP</Text>
            </View>
            {showSearch && (
              <View>
                <Text className="font-semibold text-[12px] text-ink">State Planner</Text>
                <Text className="text-[10px] text-muted">Madhya Pradesh</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className="flex-1 flex-row">
        {/* ── Sidebar ── */}
        {showSidebar && (
          <View className="w-56 border-r border-line bg-white">
            <View className="px-5 pb-2 pt-5">
              <Copy className="font-bold text-[10px] text-muted">NAVIGATION</Copy>
            </View>

            {NAV_ITEMS.map((item) => (
              <SidebarLink
                key={item.id}
                item={item}
                active={activeNav === item.id}
                onPress={() => setActiveNav(item.id)}
              />
            ))}

            {/* Bottom info panel */}
            <View className="mt-auto border-t border-line p-4">
              <View className="rounded-lg bg-canvas p-3">
                <Copy className="font-bold text-[9px] text-muted">
                  POWERED BY
                </Copy>
                <Copy className="mt-1 text-[11px] leading-[16px] text-ink">
                  Ministry of Skill Development & Entrepreneurship
                </Copy>
                <Copy className="mt-0.5 text-[10px] text-muted">
                  Skill India Mission
                </Copy>
              </View>
            </View>
          </View>
        )}

        {/* ── Main content ── */}
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 p-4 md:gap-6 md:p-6"
        >
          {/* Title bar */}
          <View className="flex-row flex-wrap items-end justify-between gap-2">
            <View className="gap-1">
              <Heading className="text-[20px] leading-[26px] md:text-[26px] md:leading-[34px]">
                Indore District Overview
              </Heading>
              <Copy className="text-[12px] text-muted md:text-[13px]">
                Real-time labour market intelligence • Last updated 2 hours ago
              </Copy>
            </View>
            <View className="self-start rounded-full bg-mint px-3 py-1">
              <Copy className="font-bold text-[11px] text-primary">
                ● LIVE DATA
              </Copy>
            </View>
          </View>

          {/* ── Summary Cards ── */}
          <View className="flex-row flex-wrap gap-4">
            {summaryStats.map((stat, i) => (
              <StatCard key={stat.id} stat={stat} index={i} />
            ))}
          </View>

          {/* ── Chart + Warnings Grid ── */}
          <View className="flex-row flex-wrap gap-4 md:gap-6">
            {/* Left: Bar Chart */}
            <View className="min-w-[320px] flex-[2] rounded-xl border border-line bg-white p-4 md:p-5">
              <View className="mb-4 gap-1">
                <View className="flex-row items-center gap-2">
                  <ChartIcon size={18} color="#287454" />
                  <Heading className="text-[15px] leading-[20px] md:text-[17px]">
                    Supply vs. Projected Demand
                  </Heading>
                </View>
                <Copy className="text-[12px] text-muted">
                  Certified workers vs. AI-predicted job openings (6-month horizon)
                </Copy>
              </View>
              <SupplyDemandChart />
            </View>

            {/* Right: Early Warnings */}
            <View className="min-w-[280px] flex-1 rounded-xl border border-line bg-white p-4 md:p-5">
              <View className="mb-4 gap-1">
                <View className="flex-row items-center gap-2">
                  <AlertTriangle size={18} color="#F59E0B" />
                  <Heading className="text-[15px] leading-[20px] md:text-[17px]">
                    Early Warning Signals
                  </Heading>
                </View>
                <Copy className="text-[12px] text-muted">
                  AI-generated alerts for government planners
                </Copy>
              </View>
              <View className="gap-3">
                {earlyWarnings.map((w) => (
                  <WarningCard key={w.id} warning={w} />
                ))}
              </View>
            </View>
          </View>

          {/* ── Footer ── */}
          <View className="flex-row items-center justify-center gap-2 py-2">
            <Copy className="text-[11px] text-muted">
              LocalFix × MSDE Intelligence Portal • Indore, Madhya Pradesh • SIH 2026
            </Copy>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
