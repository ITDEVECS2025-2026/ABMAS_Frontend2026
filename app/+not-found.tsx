import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Halaman tidak ditemukan</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Kembali ke Beranda</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  title: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  link: { marginTop: 15 },
  linkText: { color: COLORS.primaryLight },
});