import React from 'react';
import { useMediaQuery } from '@/lib/utils';

const ExampleComponent = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div>
      {isMobile ? (
        <p>This is displayed on mobile devices.</p>
      ) : (
        <p>This is displayed on larger screens.</p>
      )}
    </div>
  );
};

export default ExampleComponent; 