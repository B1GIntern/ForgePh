const { toast } = useToast();
const navigate = useNavigate();

useEffect(() => {
  const verifyEmail = async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");

    if (!token) {
      toast({
        title: "Error",
        description: "No verification token provided.",
        type: "background",
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/verify-email?token=${token}`, {
        method: "GET",
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Email Verified!",
          description: "Your account is now fully activated.",
          type: "foreground",
        });
        navigate("/verification-success"); // Redirect to verification success page
      } else {
        toast({
          title: "Error",
          description: result.message,
          type: "foreground",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify email.",
        type: "background",
      });
    }
  };

  verifyEmail();
}, [toast, navigate]);
