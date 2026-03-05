import { useNavigate, useLocation, type NavigateOptions } from 'react-router-dom';

export const useSmartNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const smartNavigate = (targetPath: string | number, options?: NavigateOptions) => {
    if (typeof targetPath === 'number') {
      navigate(targetPath);
      return;
    }

    if (location.pathname === targetPath) {
      console.log(`[SYSTEM] Already at sector: ${targetPath}. Navigation aborted.`);
      return;
    }

    navigate(targetPath, options);
  };

  return smartNavigate;
};