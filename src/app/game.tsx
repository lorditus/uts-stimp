import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { Directions, Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const COLS = 9;
const ROWS = 11;
const CELL_SIZE = width / COLS;

const START_X = Math.floor(COLS / 2);
const START_Y = ROWS - 1;

const INITIAL_VEHICLES = [
  { id: 1, row: 8, x: 0, speed: 0.05, img: require('../../assets/images/truck.png'), width: 2 },
  { id: 2, row: 8, x: -5, speed: 0.05, img: require('../../assets/images/truck.png'), width: 2 },
  { id: 3, row: 7, x: 9, speed: -0.08, img: require('../../assets/images/car.png'), width: 1.5 },
  { id: 4, row: 7, x: 14, speed: -0.08, img: require('../../assets/images/car.png'), width: 1.5 },
  { id: 5, row: 6, x: 0, speed: 0.15, img: require('../../assets/images/race_car.png'), width: 1.5 },
  { id: 6, row: 6, x: -6, speed: 0.15, img: require('../../assets/images/race_car.png'), width: 1.5 },
];

const INITIAL_LOGS = [
  { id: 7, row: 3, x: 9, speed: -0.05, img: require('../../assets/images/log_medium.png'), width: 2.5 },
  { id: 8, row: 3, x: 15, speed: -0.05, img: require('../../assets/images/log_medium.png'), width: 2.5 },
  { id: 9, row: 2, x: 0, speed: 0.08, img: require('../../assets/images/log_large.png'), width: 3 },
  { id: 10, row: 2, x: -6, speed: 0.08, img: require('../../assets/images/log_large.png'), width: 3 },
  { id: 11, row: 1, x: 9, speed: -0.04, img: require('../../assets/images/log_small.png'), width: 2 },
  { id: 12, row: 1, x: 14, speed: -0.04, img: require('../../assets/images/log_small.png'), width: 2 },
];

export default function GameScreen() {
  const router = useRouter();
  const [frogPos, setFrogPos] = useState({ x: START_X, y: START_Y });
  // Status katak: 'idle', 'dead', 'drown'
  const [frogState, setFrogState] = useState<'idle'|'dead'|'drown'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [logs, setLogs] = useState(INITIAL_LOGS);

  const endGame = useCallback((finalScore: number) => {
    setGameOver(true);
    router.replace(`/result?score=${finalScore}` as any);
  }, [router]);

  // Game Loop
  useEffect(() => {
    if (gameOver || frogState !== 'idle') return; // Hentikan pergerakan kalau lagi animasi mati
    
    let animationFrameId: number;
    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 16; 
      lastTime = now;

      setVehicles(prev => prev.map(v => {
        let newX = v.x + v.speed * dt;
        if (v.speed > 0 && newX > COLS + 2) newX = -v.width - 1;
        if (v.speed < 0 && newX < -v.width - 2) newX = COLS + 1;
        return { ...v, x: newX };
      }));

      setLogs(prev => prev.map(l => {
        let newX = l.x + l.speed * dt;
        if (l.speed > 0 && newX > COLS + 2) newX = -l.width - 1;
        if (l.speed < 0 && newX < -l.width - 2) newX = COLS + 1;
        return { ...l, x: newX };
      }));

      // Cek tabrakan
      setFrogPos(prevFrog => {
        let newFrogX = prevFrog.x;
        const y = prevFrog.y;

        // Jalan Raya
        if (y >= 6 && y <= 8) {
          const hitCar = vehicles.find(v => v.row === y && prevFrog.x < v.x + v.width - 0.2 && prevFrog.x + 0.8 > v.x);
          if (hitCar) {
            runOnJS(setFrogState)('dead');
            setTimeout(() => {
              runOnJS(setFrogState)('idle');
              runOnJS(setFrogPos)({ x: START_X, y: START_Y });
            }, 500);
            return prevFrog;
          }
        }

        // Air
        if (y >= 1 && y <= 3) {
          const onLog = logs.find(l => l.row === y && prevFrog.x + 0.5 > l.x && prevFrog.x + 0.5 < l.x + l.width);
          if (onLog) {
            newFrogX += onLog.speed * dt;
            if (newFrogX < 0 || newFrogX > COLS - 1) {
              runOnJS(setFrogState)('drown');
              setTimeout(() => {
                runOnJS(setFrogState)('idle');
                runOnJS(setFrogPos)({ x: START_X, y: START_Y });
              }, 500);
              return prevFrog;
            }
          } else {
            runOnJS(setFrogState)('drown');
            setTimeout(() => {
              runOnJS(setFrogState)('idle');
              runOnJS(setFrogPos)({ x: START_X, y: START_Y });
            }, 500);
            return prevFrog;
          }
        }

        return { x: newFrogX, y };
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameOver, vehicles, logs, frogState]);

  // Timer mundur
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  // Cek waktu habis
  useEffect(() => {
    if (timeLeft <= 0 && !gameOver) {
      endGame(score);
    }
  }, [timeLeft, gameOver, score, endGame]);

  // Fungsi Swipe
  const moveFrog = useCallback((dx: number, dy: number) => {
    if (gameOver || frogState !== 'idle') return;
    setFrogPos(prev => {
      let newX = Math.round(prev.x) + dx;
      let newY = prev.y + dy;

      if (newX < 0) newX = 0;
      if (newX >= COLS) newX = COLS - 1;
      if (newY < 0) newY = 0;
      if (newY >= ROWS) newY = ROWS - 1;

      if (newY === 0) {
        setScore(s => s + 1);
        return { x: START_X, y: START_Y };
      }

      return { x: newX, y: newY };
    });
  }, [gameOver, frogState]);

  const swipeUp = Gesture.Fling().direction(Directions.UP).onEnd(() => { runOnJS(moveFrog)(0, -1); });
  const swipeDown = Gesture.Fling().direction(Directions.DOWN).onEnd(() => { runOnJS(moveFrog)(0, 1); });
  const swipeLeft = Gesture.Fling().direction(Directions.LEFT).onEnd(() => { runOnJS(moveFrog)(-1, 0); });
  const swipeRight = Gesture.Fling().direction(Directions.RIGHT).onEnd(() => { runOnJS(moveFrog)(1, 0); });

  const composedGestures = Gesture.Exclusive(swipeUp, swipeDown, swipeLeft, swipeRight);

  // Tentukan aset gambar katak berdasarkan state
  let currentFrogImg = require('../../assets/images/frog.png');
  if (frogState === 'dead') currentFrogImg = require('../../assets/images/frog_dead.png');
  else if (frogState === 'drown') currentFrogImg = require('../../assets/images/frog_drown.png');

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Skor: {score}</Text>
        <Text style={styles.headerText}>Waktu: {timeLeft}s</Text>
      </View>

      <GestureDetector gesture={composedGestures}>
        <View style={styles.gameArea}>
          {/* Latar Belakang Image */}
          <Image source={require('../../assets/images/grass.png')} style={[styles.bgImage, { top: 0 * CELL_SIZE, height: CELL_SIZE }]} />
          <Image source={require('../../assets/images/water.png')} style={[styles.bgImage, { top: 1 * CELL_SIZE, height: CELL_SIZE * 3 }]} />
          <Image source={require('../../assets/images/ground.png')} style={[styles.bgImage, { top: 4 * CELL_SIZE, height: CELL_SIZE * 2 }]} />
          <Image source={require('../../assets/images/roas.png')} style={[styles.bgImage, { top: 6 * CELL_SIZE, height: CELL_SIZE * 3 }]} />
          <Image source={require('../../assets/images/grass.png')} style={[styles.bgImage, { top: 9 * CELL_SIZE, height: CELL_SIZE * 2 }]} />

          {/* Render Kendaraan */}
          {vehicles.map(v => (
            <Image
              key={`v-${v.id}`}
              source={v.img}
              style={[
                styles.entity,
                { width: CELL_SIZE * v.width, height: CELL_SIZE, left: v.x * CELL_SIZE, top: v.row * CELL_SIZE }
              ]}
            />
          ))}

          {/* Render Batang Kayu */}
          {logs.map(l => (
            <Image
              key={`l-${l.id}`}
              source={l.img}
              style={[
                styles.entity,
                { width: CELL_SIZE * l.width, height: CELL_SIZE, left: l.x * CELL_SIZE, top: l.row * CELL_SIZE }
              ]}
            />
          ))}

          {/* Render Katak */}
          <Image
            source={currentFrogImg}
            style={[
              styles.frog,
              { width: CELL_SIZE, height: CELL_SIZE, left: frogPos.x * CELL_SIZE, top: frogPos.y * CELL_SIZE }
            ]}
          />
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 20, paddingTop: 50, backgroundColor: '#333',
  },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  gameArea: { flex: 1, position: 'relative', backgroundColor: '#fff', overflow: 'hidden' },
  row: { position: 'absolute', width: '100%', height: CELL_SIZE },
  bgImage: { position: 'absolute', width: '100%', resizeMode: 'cover' },
  frog: { position: 'absolute', resizeMode: 'contain', zIndex: 100 },
  entity: { position: 'absolute', resizeMode: 'contain', zIndex: 50 },
});
