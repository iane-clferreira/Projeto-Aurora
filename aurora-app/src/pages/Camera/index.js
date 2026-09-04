import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [type, setType] = useState('back');

  const [isActive, setIsActive] = useState(false);
  const [photo, setPhoto] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => {
        setIsActive(false);
        setPhoto(null); // limpa ao sair da aba
      };
    }, [])
  );

   if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text onPress={requestPermission}>
          Permitir acesso à câmera
        </Text>
      </View>
    );
  }

  
   function toggleCameraType() {
    setType((current) =>
      current === 'back'
        ? 'front'
        : 'back'
    );
  }

  async function takePicture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });
      setPhoto(photo);
      console.log('Foto capturada:', photo.uri);
    }
  }

  return (
    <View style={styles.container}>
      {/* CÂMERA */}
      {!photo && isActive && (
        <>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={type}
          />

          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              accessibilityLabel="Tirar foto"
              accessibilityHint="Captura a imagem para descrição"
            />
             <TouchableOpacity style={styles.buttonFlip} onPress={toggleCameraType}>
                <FontAwesome name="exchange" size={23} color="#AB00D6" />
            </TouchableOpacity>
          </View>

         

        </>
      )}

      {/* PRÉVIA DA FOTO */}
      {photo && (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: photo.uri }}
            style={styles.preview}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setPhoto(null)}
              accessibilityLabel="Tirar outra foto"
            >
              <Text style={styles.actionText}>Tirar outra</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                console.log('Usar foto:', photo.uri);
              }}
              accessibilityLabel="Usar foto"
            >
              <Text style={styles.actionText}>Usar foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  captureContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },

  captureButton: {
    width: 70,
    height: 70,
    marginBottom: 100,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#ccc',
  },

  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },

  preview: {
    flex: 1,
    resizeMode: 'contain',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#111',
  },

  actionButton: {
    padding: 12,
  },

  actionText: {
    color: '#fff',
    fontSize: 18,
  },
  buttonFlip: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
