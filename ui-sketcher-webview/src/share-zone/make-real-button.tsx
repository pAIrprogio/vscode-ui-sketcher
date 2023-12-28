export const MakeRealButton = () => {
  return (
    <button
      className="btn btn-primary pointer-events-auto"
      onClick={() => {
        alert("Casting magic...");
      }}
    >
      Make Real
    </button>
  );
};
