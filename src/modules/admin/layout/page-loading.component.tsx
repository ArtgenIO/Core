import { useEffect, useState } from 'react';
import Spinner from 'react-spinners/RingLoader';

export default function PageLoading() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(true);
    }, 200);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      className={
        'flex flex-row justify-center pt-60 transition-opacity duration-500 ease-in-out ' +
        (visible ? 'opacity-100' : 'opacity-0')
      }
    >
      <Spinner loading={true} size={110} color={'#46bdc6'}></Spinner>
    </div>
  );
}
