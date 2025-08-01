import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { useState } from 'react';

export default function HomeScreen() {
  const [apiResponse, setApiResponse] = useState('');

  const testAPI = async () => {
    try {
      Alert.alert("Button pressed")
      const response = await fetch('http://10.0.0.17:8091/api/test');
      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));
      Alert.alert('Success!', 'Connected to Spring Boot API');
    } catch (error) {
      Alert.alert('Error', 'Could not connect to API');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fitness Platform</Text>
      <Button title="Test Spring Boot API" onPress={testAPI} />
      {apiResponse ? (
        <Text style={styles.response}>{apiResponse}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  response: {
    marginTop: 20,
    fontSize: 12,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
});