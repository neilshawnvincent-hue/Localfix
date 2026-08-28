import React from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export const FadeTransitionView = ({ children }: { children: React.ReactNode }) => {
  return (
    <Animated.View 
      entering={FadeIn.duration(300)} 
      exiting={FadeOut.duration(300)} 
      style={{ flex: 1 }}
    >
      {children}
    </Animated.View>
  );
};
