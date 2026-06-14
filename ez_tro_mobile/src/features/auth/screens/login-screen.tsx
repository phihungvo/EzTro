import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/features/auth/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppText } from '@/shared/components/app-text';
import { Screen } from '@/shared/components/screen';

export function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const { errorMessage, isSubmitting, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const canSubmit = username.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleLogin() {
    if (!username.trim() || !password) {
      setLocalError('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    setLocalError(null);

    try {
      await login({
        password,
        username: username.trim(),
      });
    } catch {
      // Auth context exposes the API message for the form.
    }
  }

  return (
    <Screen contentContainerStyle={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.keyboard}>
        <View style={styles.header}>
          <AppText variant="eyebrow">EZ Tro Mobile</AppText>
          <AppText variant="title">Đăng nhập</AppText>
          <AppText muted>Nhập tài khoản người thuê để tải phòng, hóa đơn và dữ liệu cá nhân.</AppText>
        </View>

        <View style={[styles.form, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <View style={styles.field}>
            <AppText variant="label">Tên đăng nhập</AppText>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              onChangeText={setUsername}
              placeholder="username"
              placeholderTextColor={palette.mutedText}
              style={[styles.input, { borderColor: palette.border, color: palette.text }]}
              value={username}
            />
          </View>

          <View style={styles.field}>
            <AppText variant="label">Mật khẩu</AppText>
            <TextInput
              editable={!isSubmitting}
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
              placeholder="password"
              placeholderTextColor={palette.mutedText}
              secureTextEntry
              style={[styles.input, { borderColor: palette.border, color: palette.text }]}
              value={password}
            />
          </View>

          {localError || errorMessage ? (
            <View style={styles.errorBox}>
              <AppText style={styles.errorText}>{localError || errorMessage}</AppText>
            </View>
          ) : null}

          <Pressable
            disabled={!canSubmit}
            onPress={handleLogin}
            style={[styles.submitButton, !canSubmit ? styles.submitButtonDisabled : undefined]}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <AppText style={styles.submitText} variant="label">
                Đăng nhập
              </AppText>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
  },
  keyboard: {
    gap: 22,
  },
  header: {
    gap: 8,
  },
  form: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  field: {
    gap: 8,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorBox: {
    backgroundColor: '#FEECEC',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    color: '#B42318',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#176B87',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 50,
  },
  submitButtonDisabled: {
    opacity: 0.55,
  },
  submitText: {
    color: '#FFFFFF',
  },
});
