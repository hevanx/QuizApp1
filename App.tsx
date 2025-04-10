import React, { useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  Button,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

type QuestionType = 'multiple-choice' | 'multiple-answer' | 'true-false';

interface QuestionData {
  prompt: string;
  type: QuestionType;
  choices: string[];
  correct: number | number[];
}

type RootStackParamList = {
  Question: {
    data: QuestionData[];
    index: number;
    userAnswers: number[][];
  };
  Summary: {
    data: QuestionData[];
    userAnswers: number[][];
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const quizData: QuestionData[] = [
  {
    prompt: 'Which of the following is a fruit?',
    type: 'multiple-choice',
    choices: ['Carrot', 'Apple', 'Potato', 'Celery'],
    correct: 1,
  },
  {
    prompt: 'Select all even numbers:',
    type: 'multiple-answer',
    choices: ['1', '2', '3', '4'],
    correct: [1, 3],
  },
  {
    prompt: 'The sky is blue.',
    type: 'true-false',
    choices: ['False', 'True'],
    correct: 1,
  },
];

/** === Question Component === */
type QuestionProps = NativeStackScreenProps<RootStackParamList, 'Question'>;

function Question({ route, navigation }: QuestionProps) {
  const { data, index, userAnswers } = route.params;
  const [selected, setSelected] = useState<number[]>([]);

  const question = data[index];
  const isMultipleAnswer = question.type === 'multiple-answer';

  const handleSelect = (value: number) => {
    if (isMultipleAnswer) {
      setSelected((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    } else {
      setSelected([value]);
    }
  };

  const handleNext = () => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[index] = selected;

    if (index + 1 < data.length) {
      navigation.push('Question', {
        data,
        index: index + 1,
        userAnswers: updatedAnswers,
      });
    } else {
      navigation.replace('Summary', {
        data,
        userAnswers: updatedAnswers,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      <View testID="choices">
        {question.choices.map((choice, idx) => {
          const isSelected = selected.includes(idx);
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => handleSelect(idx)}
              style={[
                styles.choiceButton,
                isSelected && styles.choiceButtonSelected,
              ]}
            >
              <Text
                style={isSelected ? styles.choiceTextSelected : styles.choiceText}
              >
                {choice}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Button
        title="Next"
        testID="next-question"
        onPress={handleNext}
        disabled={selected.length === 0}
      />
    </View>
  );
}

/** === Summary Component === */
type SummaryProps = NativeStackScreenProps<RootStackParamList, 'Summary'>;

function Summary({ route }: SummaryProps) {
  const { data, userAnswers } = route.params;

  const getCorrect = (correct: number | number[], selected: number[]) => {
    if (Array.isArray(correct)) {
      return (
        Array.isArray(selected) &&
        correct.length === selected.length &&
        correct.every((v) => selected.includes(v))
      );
    }
    return selected.includes(correct);
  };

  const score = data.reduce((acc, q, i) => {
    return acc + (getCorrect(q.correct, userAnswers[i]) ? 1 : 0);
  }, 0);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.score} testID="total">
        Total Score: {score} / {data.length}
      </Text>
      {data.map((q, i) => (
        <View key={i} style={{ marginBottom: 20 }}>
          <Text style={styles.prompt}>{q.prompt}</Text>
          {q.choices.map((choice, idx) => {
            const userSelected = userAnswers[i]?.includes(idx);
            const isCorrect = Array.isArray(q.correct)
              ? q.correct.includes(idx)
              : q.correct === idx;

            let style: any = { color: '#000' };
            if (userSelected && isCorrect) {
              style.fontWeight = 'bold';
            } else if (userSelected && !isCorrect) {
              style.textDecorationLine = 'line-through';
            }

            return (
              <Text key={idx} style={style}>
                - {choice}
              </Text>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

/** === App Entry === */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Question"
          component={Question}
          initialParams={{ data: quizData, index: 0, userAnswers: [] }}
        />
        <Stack.Screen name="Summary" component={Summary} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: '#f9f9f9',
      flex: 1,
    },
    prompt: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 12,
      color: '#333',
    },
    choiceButton: {
      backgroundColor: '#f0f0f0',
      paddingVertical: 14,
      paddingHorizontal: 10,
      marginVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ccc',
    },
    choiceButtonSelected: {
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
      },
    choiceText: {
      color: '#222',
      fontSize: 16,
    },
    choiceTextSelected: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
      },
    score: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2d2d2d',
      marginBottom: 16,
    },
  });
  
