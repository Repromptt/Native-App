import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import images from "@/constants/images";
import * as Updates from 'expo-updates';

const slides = [
  {
    title: "Welcome to RePromptt",
    description: "Your personal AI assistant that rewrites, improves, and fixes any prompt — instantly and effortlessly.",
    image: images.icon,
  },
  {
    title: "Just Type or Speak",
    description: "Enter a rough idea, an unclear prompt, or simply talk — RePromptt understands and adapts.",
    image: images.avatar,
  },
  {
    title: "Get Better Prompts Instantly",
    description: "RePromptt refines your input into clear, powerful prompts optimized for AI tools. Just copy and go.",
    image: images.japan,
  },
  {
    title: "Learn While You Use",
    description: "Unlock mini tips, smart suggestions, and insights to improve your prompting skills naturally over time.",
    image: images.onboarding,
  },
];



export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(-1); // -1 = Get Started

  useEffect(() => {
    const checkFirstTime = async () => {
      const token = await AsyncStorage.getItem("FirstTime");
      if (token) {
        router.replace("/explore");
      } else {
        setIsLoading(false);
      }
    };
    checkFirstTime();
  }, []);

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await AsyncStorage.setItem("FirstTime", "1");
      router.replace("/explore");
      Updates.reloadAsync();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  if (currentSlide === -1) {
    return (
      <LinearGradient
        colors={["#0f051d", "#3b0c59", "#833ab4"]}
        style={styles.container}
      >
        <SafeAreaView style={styles.centered}>
          <Image source={images.icon} style={styles.logo} />
          <Text style={styles.welcome}>RePromptt</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => setCurrentSlide(0)}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const { title, description, image } = slides[currentSlide];

return (
  <LinearGradient
    colors={["#0f051d", "#3b0c59", "#833ab4", "#b95dd3", "#2d0039"]}
    start={{ x: 0.2, y: 0.5 }}
    end={{ x: 0.7, y: 1.1 }}
    style={styles.container}
  >
    <SafeAreaView style={styles.slide}>
      <Image source={image} style={styles.slideImage} />
      <Text style={styles.slideTitle}>{title}</Text>
      <Text style={styles.slideDesc}>{description}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.backButton, currentSlide === 0 && { opacity: 0 }]}
          disabled={currentSlide === 0}
          onPress={() => setCurrentSlide(currentSlide - 1)}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentSlide === slides.length - 1 ? "Continue" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  </LinearGradient>
);

}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 25,
    borderRadius: 20,
  },
  welcome: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: "#7a4df1",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    elevation: 5,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  slideImage: {
    width: width * 0.9,
    height: width * 0.9,
    marginBottom: 40,
    borderRadius: 20,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  slideDesc: {
    fontSize: 16,
    color: "#e0d7ff",
    textAlign: "center",
    fontWeight:600,
    marginBottom: 40,
  },
  nextButton: {
    backgroundColor: "#7a3aff",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 16,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
  paddingHorizontal: 20,
},
backButton: {
  backgroundColor: "#7a3adf",
  paddingVertical: 14,
  paddingHorizontal: 30,
  borderRadius: 16,
  elevation: 4,
  marginRight: 10,
},

});
