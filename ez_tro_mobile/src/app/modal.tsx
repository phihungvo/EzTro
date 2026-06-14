import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { Screen } from '@/shared/components/screen';

export default function ModalScreen() {
  return (
    <Screen contentContainerStyle={styles.container}>
      <AppText variant="title">EZ Tro Mobile</AppText>
      <AppText muted style={styles.description}>
        Khung project đã được tách theo route, feature, service và shared component.
      </AppText>
      <Link href="/" dismissTo style={styles.link}>
        <AppText variant="link">Quay lại tổng quan</AppText>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  description: {
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
