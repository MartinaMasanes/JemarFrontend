const Background = ({ image, children }) => {
  return (
    <>
      <div
      className="background min-vh-100"
        style={{
          backgroundImage: `url(${image})`
        }}
      >
        {children}
      </div>
    </>
  );
}

export default Background;