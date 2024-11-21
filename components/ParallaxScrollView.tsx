import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

type Props = PropsWithChildren<{
  headerBackgroundColor: { dark: string; light: string };
  headerImage?: ReactElement;
  headerHeight?: number;
}>;

export default function ParallaxScrollView({
  children,
  headerBackgroundColor,
  headerImage,
  headerHeight = 150,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const bottom = useBottomTabOverflow();

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}>
        {headerHeight > 0 && (
          <Animated.View
            style={[
              styles.header,
              { 
                backgroundColor: headerBackgroundColor[colorScheme],
                height: headerHeight 
              },
            ]}>
            {headerImage}
          </Animated.View>
        )}
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
});