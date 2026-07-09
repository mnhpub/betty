import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import * as api from './lib/api';
import type { ApiUser } from './lib/api';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';

type Screen = 'loading' | 'login' | 'signup' | 'home';

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    api.fetchCurrentUser().then((current) => {
      if (current) {
        setUser(current);
        setScreen('home');
      } else {
        setScreen('login');
      }
    });
  }, []);

  function handleAuthenticated(authedUser: ApiUser) {
    setUser(authedUser);
    setScreen('home');
  }

  async function handleLogout() {
    await api.logout();
    setUser(null);
    setScreen('login');
  }

  return (
    <View style={styles.container}>
      {screen === 'loading' && <ActivityIndicator />}
      {screen === 'login' && (
        <LoginScreen
          onAuthenticated={handleAuthenticated}
          onNavigateToSignup={() => setScreen('signup')}
        />
      )}
      {screen === 'signup' && (
        <SignupScreen
          onAuthenticated={handleAuthenticated}
          onNavigateToLogin={() => setScreen('login')}
        />
      )}
      {screen === 'home' && user && <HomeScreen user={user} onLogout={handleLogout} />}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
