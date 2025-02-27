'use client';

import { useState, useEffect } from 'react';
import Minesweeper from '../components/Minesweeper';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">マインスイーパー</h1>
      <Minesweeper />
    </div>
  );
}
