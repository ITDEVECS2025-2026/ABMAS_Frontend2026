import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { SensorProvider } from '../store/sensorContext';

export default function SoilLayout() {
  return (
    <SensorProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.primary,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: COLORS.primaryLight,
          tabBarInactiveTintColor: COLORS.textMuted,
        }}
      >
        <Tabs.Screen
          name="(analysis)"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(sensor)"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="(setting)"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SensorProvider>
  );
}