import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GiftReport() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/birthday-report', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Redirecting to Birthday Report...</p>
    </div>
  );
}
