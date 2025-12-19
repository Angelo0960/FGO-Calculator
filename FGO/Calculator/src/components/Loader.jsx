import { FaSpinner } from 'react-icons/fa';

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-16 h-16 border-4 border-gray-700 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-fgo-gold border-transparent rounded-full animate-spin"></div>
          <FaSpinner className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-fgo-gold text-2xl animate-spin" />
        </div>
        <p className="mt-4 text-lg text-gray-300 animate-pulse">{message}</p>
        <p className="text-sm text-gray-500 mt-2">Fetching data from Atlas Academy...</p>
      </div>
    </div>
  );
};

export default Loader;