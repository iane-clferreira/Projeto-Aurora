import { Audio } from 'expo-av';

async function CommandVoz() {
  await Audio.requestPermissionsAsync();

  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );

  await recording.startAsync();
  Speech.speak('Estou ouvindo');

  setTimeout(async () => {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('ÁUDIO:', uri);
    Speech.speak('Comando capturado');
  }, 4000);
}
