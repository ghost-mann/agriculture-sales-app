import { StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { Brand } from '@/constants/theme';
import { fmtDate } from '@/lib/format';
import type { Section } from '../store';

// Plain-language names for the terser KPI keys; anything not listed falls back
// to a title-cased version of the key.
const KPI_LABELS: Record<string, string> = {
  conv_rate: 'Conversion %',
  win_rate: 'Win rate %',
  to_opp: 'To opportunity',
  to_quot: 'To quotation',
  from_prospect: 'From prospects',
  with_opp: 'With opportunity',
  to_customer: 'Became customers',
  this_quarter: 'This quarter',
  new_30d: 'New (30 days)',
  emails_sent: 'Emails sent',
  emails_recv: 'Emails received',
  tasks_open: 'Open tasks',
  tasks_high: 'High priority',
  events_open: 'Open events',
  events_total: 'Events',
};

function humanize(key: string): string {
  return KPI_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function rowOf(section: Section, r: any): { title: string; meta: string; status?: string } {
  switch (section) {
    case 'leads':
      return {
        title: r.lead_name || r.company_name || r.name,
        meta: [r.company_name, r.territory, r.source].filter(Boolean).join(' · '),
        status: r.status,
      };
    case 'opps':
      return {
        title: r.customer_name || r.party_name || r.name,
        meta: [r.sales_stage, r.territory, r.probability != null ? `${r.probability}%` : null]
          .filter(Boolean)
          .join(' · '),
        status: r.status,
      };
    case 'prosp':
      return {
        title: r.company_name || r.name,
        meta: [r.industry, r.territory, r.no_of_employees].filter(Boolean).join(' · '),
      };
    case 'cust':
      return {
        title: r.customer_name || r.name,
        meta: [r.customer_group, r.territory].filter(Boolean).join(' · '),
        status: r.disabled ? 'Disabled' : 'Active',
      };
    case 'act':
      return {
        title: r.subject || r.activity_type || r.name,
        meta: [r.reference_doctype && `${r.reference_doctype} ${r.reference_name || ''}`.trim(), fmtDate(r.activity_date || r.communication_date)]
          .filter(Boolean)
          .join(' · '),
        status: r.email_status,
      };
    default:
      return { title: r.name, meta: '' };
  }
}

function Rows({ section, rows }: { section: Section; rows: any[] }) {
  if (!rows?.length) return <Text style={styles.empty}>Nothing here.</Text>;
  return (
    <View style={{ gap: 8 }}>
      {rows.map((r, i) => {
        const v = rowOf(section, r);
        return (
          <View key={r.name || i} style={styles.row}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.title} numberOfLines={1}>
                {v.title}
              </Text>
              {v.meta ? (
                <Text style={styles.meta} numberOfLines={1}>
                  {v.meta}
                </Text>
              ) : null}
            </View>
            {v.status ? <StatusBadge status={v.status} /> : null}
          </View>
        );
      })}
    </View>
  );
}

export function SectionView({ section, data }: { section: Section; data: any }) {
  const kpis: Record<string, any> = data?.kpis ?? {};

  return (
    <View style={{ gap: 18 }}>
      {/* KPI chips */}
      <View style={styles.chips}>
        {Object.entries(kpis).map(([k, val]) => (
          <View key={k} style={styles.chip}>
            <Text style={styles.chipValue}>{typeof val === 'number' ? val : String(val)}</Text>
            <Text style={styles.chipLabel}>{humanize(k)}</Text>
          </View>
        ))}
      </View>

      {/* Events section has several lists; everything else uses `rows`. */}
      {section === 'evt' ? (
        <>
          <Text style={styles.sectionTitle}>Open tasks</Text>
          <View style={{ gap: 8 }}>
            {(data?.todos ?? []).slice(0, 50).map((t: any, i: number) => (
              <View key={t.name || i} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={2}>
                    {t.description?.replace(/<[^>]+>/g, '') || t.name}
                  </Text>
                  {t.allocated_to ? <Text style={styles.meta}>{t.allocated_to}</Text> : null}
                </View>
                <StatusBadge status={t.priority} />
              </View>
            ))}
            {!(data?.todos ?? []).length ? <Text style={styles.empty}>No open tasks.</Text> : null}
          </View>

          <Text style={styles.sectionTitle}>Events</Text>
          <View style={{ gap: 8 }}>
            {(data?.events ?? []).slice(0, 50).map((e: any, i: number) => (
              <View key={e.name || i} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={2}>
                    {e.subject || e.name}
                  </Text>
                  <Text style={styles.meta}>{fmtDate(e.starts_on)}</Text>
                </View>
                <StatusBadge status={e.status} />
              </View>
            ))}
            {!(data?.events ?? []).length ? <Text style={styles.empty}>No events.</Text> : null}
          </View>
        </>
      ) : (
        <Rows section={section} rows={data?.rows ?? []} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: Brand.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: '30%',
    flexGrow: 1,
  },
  chipValue: { fontSize: 18, fontWeight: '700', color: Brand.text },
  chipLabel: {
    fontSize: 10,
    color: Brand.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 14,
  },
  title: { fontSize: 14, fontWeight: '600', color: Brand.text },
  meta: { fontSize: 11.5, color: Brand.text3, marginTop: 2 },
  empty: { color: Brand.text3, fontSize: 13, paddingVertical: 8 },
});
