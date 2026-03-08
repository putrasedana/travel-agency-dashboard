import { useNavigate } from "react-router";
import { logoutUser } from "~/appwrite/auth";

const PageLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/sign-in");
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-8 shadow-sm bg-white">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 rounded-lg border border-red-500 hover:bg-red-50 px-5 py-2.5 cursor-pointer"
        >
          <img src="/assets/icons/logout.svg" alt="logout" className="size-5" />
          Logout
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="rounded-lg bg-primary-100 text-white px-5 py-2.5 hover:opacity-90 transition cursor-pointer"
        >
          Dashboard
        </button>
      </div>
    </div>
  );
};
export default PageLayout;
