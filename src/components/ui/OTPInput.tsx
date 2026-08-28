import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

export type OTPInputHandle = {
  reset: () => void;
};

type OTPInputProps = {
  length?: number;
  onComplete: (code: string) => void;
  label?: string;
};

const OTPInput = forwardRef<OTPInputHandle, OTPInputProps>(
  ({ length = 6, onComplete, label }, ref) => {
    const [code, setCode] = useState<string[]>(new Array(length).fill(''));
    const inputs = useRef<(TextInput | null)[]>([]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setCode(new Array(length).fill(''));
        inputs.current[0]?.focus();
      },
    }));

    const handleChange = (text: string, index: number) => {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      if (text && index < length - 1) {
        inputs.current[index + 1]?.focus();
      }

      if (newCode.every((d) => d !== '')) {
        onComplete(newCode.join(''));
      }
    };

    const handleKeyPress = (e: any, index: number) => {
      if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
        inputs.current[index - 1]?.focus();
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
      }
    };

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.row}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(r) => { inputs.current[index] = r; }}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              style={styles.input}
              selectionColor="#3B82F6"
            />
          ))}
        </View>
      </View>
    );
  }
);

OTPInput.displayName = 'OTPInput';

export default OTPInput;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    width: 48,
    height: 64,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    color: '#1A1A1A',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
});
