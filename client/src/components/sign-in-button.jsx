import axios from "axios";
import { useEffect } from "react";

const EmailVerificationButton = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.phone.email/verify_email_v1.js";
    script.async = true;
    document.body.appendChild(script);

    window.phoneEmailReceiver = async (userObj) => {
      console.log("I am in phoneEmailReceiver");
      const { user_json_url, user_email_id } = userObj;

      console.log(user_json_url);
      try {
        const response = await axios.post(
          "https://coal-mines-backend.onrender.com/create-token",
          {
            user_json_url,
            user_email_id,
          }
        );

        console.log(response);
        const token = response.data.token;
        console.log("token", token);
        localStorage.setItem("token", token);
      } catch (error) {
        console.error(error);
      }
    };

    return () => {
      document.body.removeChild(script);
      delete window.phoneEmailReceiver;
    };
  }, []);

  return (
    <div
      className="pe_verify_email"
      data-client-id="14345397751322735780"
    ></div>
  );
};

export default EmailVerificationButton;
