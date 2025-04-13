import { View, Image, Text, Button, TouchableOpacity } from "react-native";
import { useCallback, useEffect, useState } from "react";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useFocusEffect } from "expo-router";

export interface Song {
  id: string;
  title: string;
  artist: string;
  path: string;
  preview: string;
}

let likedSongs: Song[] = [];

export default function HomeScreen() {
  let [curSongIndex, setCurSongIndex] = useState(0);
  let [paused, setPaused] = useState(true);
  let [sound, setSound] = useState<Audio.Sound | null>(null);
  const [duration, setDuration] = useState(1);
  const [position, setPosition] = useState(1);

  const translateX = useSharedValue(0);

  const likeSong = () => {
    let unique = true;
    likedSongs.forEach((item) => {
      if (item.id === songs[curSongIndex].id) {
        unique = false;
      }
    });
    if (unique) {
      likedSongs.unshift(songs[curSongIndex]);
      saveLikedSongs();
    }
  };

  const saveLikedSongs = async () => {
    await AsyncStorage.setItem("likedSongs", JSON.stringify(likedSongs)).catch(
      (e) => console.log(e)
    );
    // await AsyncStorage.setItem("likedSongs", "");
  };

  const getLikedSongs = async () => {
    const value = await AsyncStorage.getItem("likedSongs").catch((e) => {
      console.log(e);
    });
    if (value != null) {
      likedSongs = JSON.parse(value);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getLikedSongs();
    }, [])
  );

  useEffect(() => {
    playSound();
  }, [curSongIndex]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const songs = [
    {
      id: "1",
      title: "React Logo!",
      artist: "idk lol",
      path: "https://e.snmc.io/i/600/s/e2a2db773ad2fa176540615da15bebda/11194507/travis-scott-meltdown-Cover-Art.jpg",
      preview:
        "https://p.scdn.co/mp3-preview/644d4ce6d4a3afce512d54904ce5872ccfb94493",
    },
    {
      id: "2",
      title: "nothing!",
      artist: "nobody",
      path: "../../assets/images/icon.png",
      preview:
        "https://p.scdn.co/mp3-preview/51c08d92815cce4ac2de94a7335a430b81234624",
    },
    {
      id: "3",
      title: "NeedleDrop!",
      artist: "Sam!",
      path: "../../assets/images/needledrop_icon.png",
      preview:
        "https://p.scdn.co/mp3-preview/51c08d92815cce4ac2de94a7335a430b81234624",
    },
  ];

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      {
        uri: songs[curSongIndex].preview,
      },
      { shouldPlay: true }
    );
    setSound(sound);

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setPosition(status.positionMillis || 0);
        setDuration(status.durationMillis || 1);
      }
      if (status.isLoaded && status.didJustFinish) {
        sound.replayAsync(); // Restart the clip
      }
    });

    setPaused(false);
    await sound.playAsync();
  }

  const togglePlayback = async () => {
    if (sound) {
      if (paused) {
        await sound.playAsync();
      } else {
        await sound.pauseAsync();
      }
      setPaused(!paused);
    }
  };

  const nextSong = async () => {
    setCurSongIndex((curSongIndex + 1) % songs.length);
  };

  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > 100) {
        runOnJS(likeSong)();
        translateX.value = -500;
        runOnJS(nextSong)();
      } else if (event.translationX < -100) {
        translateX.value = 500;
        runOnJS(nextSong)();
      }
      translateX.value = withSpring(0);
    });

  const handleSliderValueChange = async (value: number) => {
    const newPos = value * duration;
    await sound?.setPositionAsync(newPos);
  };

  return (
    <View style={{ flex: 1 }}>
      <GestureHandlerRootView
        style={{
          flex: 5,
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          paddingTop: 50,
        }}
      >
        <GestureDetector gesture={swipeGesture}>
          <Animated.Image
            source={{ uri: songs[curSongIndex].path }}
            style={{
              borderWidth: 1,
              borderRadius: 10,
              width: "75%",
              height: "85%",
              transform: [{ translateX: translateX }],
            }}
          ></Animated.Image>
        </GestureDetector>
      </GestureHandlerRootView>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          paddingBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 24,
          }}
        >
          {songs[curSongIndex].title}
        </Text>
        <Text>{songs[curSongIndex].artist}</Text>
        <Slider
          style={{ width: "75%", height: "10%" }}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="#8a8a8a"
          maximumTrackTintColor="#dcdcdc"
          thumbImage={require("../../assets/images/thumbicon.png")}
          value={position / duration}
          onValueChange={(value) => handleSliderValueChange(value)}
          tapToSeek={true}
        />
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "20%",
        }}
      >
        <TouchableOpacity style={styles.sideActionButtons}>
          <Ionicons name="close-outline" size={30} color="#74B4AD"></Ionicons>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pauseButton}
          onPress={() => togglePlayback()}
        >
          <Ionicons
            name={paused ? "play" : "pause-outline"}
            size={40}
            color="#513D30"
          ></Ionicons>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sideActionButtons}>
          <Ionicons name="heart-outline" size={30} color="#D2695E"></Ionicons>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  pauseButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 50,
    padding: 10,
  },
  sideActionButtons: {
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 50,
    padding: 10,
    alignSelf: "center",
  },
});
