import { View, Image, Text, Button, TouchableOpacity } from "react-native";
import { useState } from "react";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
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

export default function HomeScreen() {
  let [curImageIndex, setCurImageIndex] = useState(0);
  let [paused, setPaused] = useState(false);

  const translateX = useSharedValue(0);

  const images = [
    require("../../assets/images/react-logo.png"),
    require("../../assets/images/icon.png"),
    require("../../assets/images/needledrop_icon.png"),
  ];

  const nextImage = () => {
    setCurImageIndex((curImageIndex + 1) % images.length);
  };

  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > 100) {
        translateX.value = -500;
        runOnJS(nextImage)();
      } else if (event.translationX < -100) {
        translateX.value = 500;
        runOnJS(nextImage)();
        console.log(curImageIndex);
      }
      translateX.value = withSpring(0);
    });

  return (
    <>
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
            source={images[curImageIndex]}
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
          slut me out 3
        </Text>
        <Text>nle choppa</Text>
        <Slider
          style={{ width: "75%", height: "10%" }}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="#8a8a8a"
          maximumTrackTintColor="#dcdcdc"
          thumbImage={require("../../assets/images/thumbicon.png")}
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
          onPress={() => setPaused(!paused)}
        >
          <Ionicons
            name={paused ? "pause-outline" : "play"}
            size={40}
            color="#513D30"
          ></Ionicons>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sideActionButtons}>
          <Ionicons name="heart-outline" size={30} color="#D2695E"></Ionicons>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}></View>
    </>
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
