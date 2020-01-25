import React, { Component, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
  FlatList,
  StyleSheet,
  Alert,
  Image,
  Dimensions
} from 'react-native';

import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

const App = () => {
  const [localizacoesBackground, setLocalizacoesBackground] = useState([]);
  const [localizacoesForeground, setLocalizacoesForeground] = useState([]);
  const [ultimaLocalizacao, setUltimaLocalizaca] = useState([]);
  let isBackground = false;

  function checarStatus() {
    BackgroundGeolocation.checkStatus(status => {
      console.log('[CHECK STATUS]');
      console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
      console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
      console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);

      if (!status.locationServicesEnabled) {
        Alert.alert('GPS desligado!', 'É necessário ativar o GPS do seu aparelho.', [
          { text: 'OK', onPress: () => { } }
        ])

        return;
      }

      if (status.authorization !== BackgroundGeolocation.AUTHORIZED) {
        setTimeout(() =>
          Alert.alert('Este App precisa da permissão de localização', 'Deseja ir para configurações?', [
            { text: 'Sim', onPress: () => BackgroundGeolocation.showAppSettings() },
            { text: 'Não', onPress: () => console.log('No Pressed'), style: 'cancel' }
          ]), 1000);
      }
    });

    setTimeout(checarStatus, 3000);
  }

  useEffect(() => {
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      debug: false,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 10000,
      activitiesInterval: 10000,
      stopOnStillActivity: false
    });

    BackgroundGeolocation.on('location', (location) => {
      const { id, latitude, longitude } = location;

      let ultimaLocalizacao_ = {
        id,
        data: formatarData(new Date()),
        latitude,
        longitude
      }

      setUltimaLocalizaca(ultimaLocalizacao_);

      let acao = isBackground ? setLocalizacoesBackground : setLocalizacoesForeground;

      acao(oldLocalizacoes => {
        oldLocalizacoes = oldLocalizacoes.slice(-4);

        return [
          ...oldLocalizacoes,
          ultimaLocalizacao_
        ]
      });
    });

    BackgroundGeolocation.on('error', (error) => {
      console.log('[ERROR] BackgroundGeolocation error:', error);
    });

    BackgroundGeolocation.on('start', () => {
      console.log('[INFO] BackgroundGeolocation service has been started');
    });

    BackgroundGeolocation.on('stop', () => {
      console.log('[INFO] BackgroundGeolocation service has been stopped');
    });

    BackgroundGeolocation.on('authorization', (status) => {
      console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(() =>
          Alert.alert('Este App precisa da permissão de localização', 'Deseja ir para configurações?', [
            { text: 'Sim', onPress: () => BackgroundGeolocation.showAppSettings() },
            { text: 'Não', onPress: () => console.log('No Pressed'), style: 'cancel' }
          ]), 1000);
      }
    });

    BackgroundGeolocation.on('background', () => {
      isBackground = true;
      console.log('[INFO] App is in background');
    });

    BackgroundGeolocation.on('foreground', () => {
      isBackground = false;
      console.log('[INFO] App is in foreground');
    });

    BackgroundGeolocation.checkStatus(status => {
      console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
      console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
      console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);

      if (!status.locationServicesEnabled) {
        Alert.alert('GPS desligado!', 'É necessário ativar o GPS do seu aparelho.', [
          { text: 'OK', onPress: () => { } }
        ])
      }

      // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
        checarStatus();
      }
    });

    return () => {
      BackgroundGeolocation.removeAllListeners();
    }
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.tituloContainer}>
          <Text style={styles.tituloTexto}>HISTÓRICO DE LOCALIZAÇÕES</Text>
        </View>

        <View style={styles.containerText}>
          <Text style={styles.tituloTexto}>Última localização</Text>
        </View>

        <Image
          style={styles.imagem}
          source={{ uri: `https://maps.googleapis.com/maps/api/staticmap?center=${ultimaLocalizacao.latitude},${ultimaLocalizacao.longitude}&zoom=17,5&size=600x300&maptype=roadmap&markers=color:red%7Clabel:L%7C${ultimaLocalizacao.latitude},${ultimaLocalizacao.longitude}&key=[API_KEY]` }}
        />

        <View style={styles.containerText}>
          <Text style={styles.tituloTexto}>Background</Text>
        </View>

        <FlatList
          style={styles.lista}
          data={localizacoesBackground}
          renderItem={({ item }) => (
            <View style={styles.itemLista}>
              <Text style={styles.labelLista}>Data:</Text>
              <Text style={styles.valorLista}>{item.data}</Text>

              <Text style={styles.labelLista}>Lat:</Text>
              <Text style={styles.valorLista}>{item.latitude}</Text>

              <Text style={styles.labelLista}>Lng:</Text>
              <Text style={styles.valorLista}>{item.longitude}</Text>
            </View>
          )}
          keyExtractor={item => item.id}
        />

        <View style={styles.containerText}>
          <Text style={styles.tituloTexto}>Foreground</Text>
        </View>

        <FlatList
          style={styles.lista}
          data={localizacoesForeground}
          renderItem={({ item }) => (
            <View style={styles.itemLista}>
              <Text style={styles.labelLista}>Data:</Text>
              <Text style={styles.valorLista}>{item.data}</Text>

              <Text style={styles.labelLista}>Lat:</Text>
              <Text style={styles.valorLista}>{item.latitude}</Text>

              <Text style={styles.labelLista}>Lng:</Text>
              <Text style={styles.valorLista}>{item.longitude}</Text>
            </View>
          )}
          keyExtractor={item => item.id}
        />
      </SafeAreaView>
    </>
  )
}

const formatarData = data => `${('00' + data.getDate()).slice(-2)}/${('00' + (data.getMonth() + 1)).slice(-2)}/${data.getFullYear()} ${('00' + data.getHours()).slice(-2)}:${('00' + data.getMinutes()).slice(-2)}:${('00' + data.getSeconds()).slice(-2)}`;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  imagem: {
    width: Dimensions.get('window').width - 20,
    flex: 1,
    margin: 10,
    backgroundColor: '#e1e4e8'
  },

  tituloContainer: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#612F74'
  },

  tituloTexto: {
    color: '#eee'
  },

  containerText: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#836FFF',
    borderRadius: 5,
    margin: 10,
    borderLeftColor: '#612F74',
    borderLeftWidth: 3
  },

  lista: {
    marginHorizontal: 15,
    flex: 1
  },

  itemLista: {
    borderBottomWidth: 1,
    flexDirection: 'row'
  },

  labelLista: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#999',
    flex: 10
  },

  valorLista: {
    fontSize: 12,
    flex: 20
  }
});

export default App;
