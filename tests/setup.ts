import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
beforeEach(() => { localStorage.clear(); window.dispatchEvent(new StorageEvent('storage', {key:null})); });
afterEach(cleanup);
