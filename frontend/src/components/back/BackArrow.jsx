import { useNavigate } from 'react-router-dom';

const BackArrow = () => {
  const navigate = useNavigate();

  const handleBackArrow = () => {
    navigate(-1);
  };

  return (
    <>
      <i
        className="bi bi-arrow-left-square-fill back-icon fs-1"
        onClick={handleBackArrow}
      ></i>
    </>
  );
};

export default BackArrow;