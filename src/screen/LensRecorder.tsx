import React, { useEffect, useRef, useState } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import DeepARView, {
  Camera,
  CameraPermissionRequestResult,
  CameraPositions,
  ErrorTypes,
  IDeepARHandle,
} from 'react-native-deepar';
import RNFS from 'react-native-fs';
import { DEEP_API_KEY } from '../utility/api_key';

const LensRecorder = () => {
  const deepARRef = useRef<IDeepARHandle>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPermission, setPermission] = useState<boolean>(false);
  const [cameraPosition, setCameraPosition] = useState<
    CameraPositions.FRONT | CameraPositions.BACK
  >(CameraPositions.FRONT);
  const [isReady, setIsReady] = useState<boolean>(false);

  const requestPermission = async () => {
    const cameraPermission = await Camera.requestCameraPermission();
    const microphonePermission = await Camera.requestMicrophonePermission();

    const isCameraAllowed =
      cameraPermission === CameraPermissionRequestResult.AUTHORIZED;
    const isMicrophoneAllowed =
      microphonePermission === CameraPermissionRequestResult.AUTHORIZED;

    if (isCameraAllowed && isMicrophoneAllowed) {
      setPermission(true);
    } else {
      Linking.openSettings();
    }
  };

  useEffect(() => {
    (async () => {
      const cam = await Camera.getCameraPermissionStatus();
      const mic = await Camera.getMicrophonePermissionStatus();

      setPermission(cam === 'authorized' && mic === 'authorized');
    })();
  }, []);

  useEffect(() => {
    deepARRef?.current?.switchEffect({
      mask: 'beard',
      slot: 'mask',
    });
  }, [isRecording]);

  const startRecording = async () => {
    if (!isReady) {
      Alert.alert('Please wait', 'DeepAR is still initializing.');
      return;
    }
    try {
      await deepARRef.current?.startRecording({
        width: 720,
        height: 1280,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = async () => {
    try {
      await deepARRef.current?.finishRecording();
    } catch (err) {
      console.error(err);
    }
  };

  const onVideoRecordingFinished = (videoPath: string) => {
    setIsRecording(false);
    const path: string = 'file://' + videoPath;
    saveVideo(path);
  };

  const saveVideo = async (path: string) => {
    const destPath: string = `${
      RNFS.DownloadDirectoryPath
    }/avaibe_video_${Date.now()}.mp4`;

    try {
      await RNFS.copyFile(path, destPath);
      Alert.alert('Saved', `Video saved to ${destPath}`);
    } catch (err) {
      console.error('Error saving video:', err);
    }
  };

  const onInitialized = () => {
    setIsReady(prev => (prev = true));
  };

  if (!isPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Pressable
          onPress={requestPermission}
          style={{
            backgroundColor: 'blue',
            paddingHorizontal: 30,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: 'white' }}>Allow Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <DeepARView
        ref={deepARRef}
        apiKey={DEEP_API_KEY || ''}
        position={cameraPosition}
        videoWarmup={true}
        onInitialized={onInitialized}
        onVideoRecordingPrepared={() => {
          console.log('onVideoRecordingPrepared');
        }}
        onVideoRecordingStarted={() => {
          setIsRecording(true);
        }}
        onVideoRecordingFinished={(path: string) =>
          onVideoRecordingFinished(path)
        }
        onError={(text: String, type: ErrorTypes) => {
          console.log('onError =>', text, 'type =>', type);
        }}
        style={{
          flex: 1,
        }}
      />
      <Pressable
        onPress={isRecording ? stopRecording : startRecording}
        style={{
          width: '100%',
          paddingVertical: 12,
          backgroundColor: isRecording ? 'red' : 'blue',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white' }}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </Pressable>
    </View>
  );
};

export default LensRecorder;
