// tests/Responsiveness.test.js

import React from 'react';
import { render } from '@testing-library/react-native';
import { Dimensions } from 'react-native';

// Ekrany, które chcemy przetestować (szerokość × wysokość w punktach)
const devices = {
  'iPhone SE': { width: 320, height: 568 },
  'iPhone 8': { width: 375, height: 667 },
  'iPhone 12 Pro Max': { width: 428, height: 926 },
  'iPad Pro': { width: 1024, height: 1366 },
};

jest.mock('react-native/Libraries/Utilities/Dimensions', () => {
  const RN = jest.requireActual('react-native');
  RN.Dimensions = {
    get: jest.fn().mockReturnValue({ width: 375, height: 667, scale: 2, fontScale: 2 }),
    set: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
  return RN.Dimensions;
});

// import ekranów do testów:
import ChatScreen from '../screens/ChatScreen';
import UsersListScreen from '../screens/UsersListScreen';

describe('Responsywność ekranów', () => {
  for (const [name, { width, height }] of Object.entries(devices)) {
    describe(`${name} (${width}×${height})`, () => {
      beforeAll(() => {
        // Ustawiamy fake’owe wymiary
        Dimensions.get.mockReturnValue({ width, height, scale: 2, fontScale: 2 });
      });

      it('ChatScreen renderuje się poprawnie', () => {
        const tree = render(<ChatScreen route={{ params: { me: { id:1 }, other: { id:2 } } }} />).toJSON();
        expect(tree).toMatchSnapshot();
      });

      it('UsersListScreen renderuje się poprawnie', () => {
        const tree = render(<UsersListScreen navigation={{ navigate: jest.fn() }} />).toJSON();
        expect(tree).toMatchSnapshot();
      });
    });
  }
});