import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { Brand } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function TabsLayout() {
  const { identity } = useAuth();
  const showCrm = !!identity?.isCrm;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Brand.green,
        tabBarInactiveTintColor: Brand.text3,
        tabBarStyle: {
          backgroundColor: Brand.surface,
          borderTopColor: Brand.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="portal"
        options={{
          title: 'My Account',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="crm"
        options={{
          title: 'CRM',
          // Customers never see this tab; the /crm backend route is also
          // role-guarded server-side. href:null fully removes the tab.
          href: showCrm ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
