import { useEffect, useState } from "react";
import FlexpaConfig from "./config.json";

function App() {
  const [FlexpaLink, setFlexpaLink] = useState(null);
  const [EOB, setEOB] = useState(null);
  const [display, setDisplay] = useState("Button");
  const [errorMsg, setErrorMsg] = useState("");

  const ButtonDisplay = () => {
    return (
      <div className="App">
        <div className="flex flex-col align-center justify-center min-h-screen">
          <button
            className="bg-sky-500 hover:bg-sky-700 rounded-full p-4 mx-auto text-white	"
            onClick={() => FlexpaLink.open()}
          >
            Connect your health data
          </button>
        </div>
      </div>
    );
  };
  const FetchDisplay = () => {
    return (
      <div className="App">
        <div className="flex flex-col align-center justify-center min-h-screen text-center">
          <p className="font-semibold text-2xl"> Fetching your data...</p>
        </div>
      </div>
    );
  };
  const EOBDisplay = () => {
    return (
      <div>
        <pre className="m-10 p-4">{JSON.stringify(EOB, null, 2)}</pre>
      </div>
    );
  };
  const ErrorDisplay = () => {
    return (
      <div className="App">
        <div className="flex flex-col align-center justify-center min-h-screen text-center">
          <p className="font-semibold text-2xl"> Unable to fetch your data</p>
          <p> {errorMsg}</p>
        </div>
      </div>
    );
  };

  const fetchEOB = async (accessToken) => {
    const request = await fetch(FlexpaConfig.eob_url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
    });
    const result = await request.json();
    return result;
  };

  const fetchAccessToken = async (publicToken) => {
    const request = await fetch(FlexpaConfig.exchange_url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        public_token: publicToken,
        secret_key: FlexpaConfig.secret_key,
      }),
    });
    const response = await request.json();
    return response.access_token;
  };

  useEffect(() => {
    if (!FlexpaLink) {
      // Global object loading code inspired by this stackoverflow answer
      // https://stackoverflow.com/questions/34424845/adding-script-tag-to-react-jsx
      const script = document.createElement("script");

      script.src = FlexpaConfig.link_object;
      script.async = true;
      script.onload = () => setFlexpaLink(window.FlexpaLink);

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }

    FlexpaLink.create({
      publishableKey: FlexpaConfig.publish_key,
      onSuccess: async (publicToken) => {
        setDisplay("Fetch");
        try {
          const accessToken = await fetchAccessToken(publicToken);
          const eob = await fetchEOB(accessToken);
          setEOB(eob);
          setDisplay("EOB");
        } catch (e) {
          setErrorMsg(JSON.stringify(e));
          setDisplay("Error");
        }
      },
    });
  });

  switch (display) {
    case "Fetch":
      return <FetchDisplay />;
    case "EOB":
      return <EOBDisplay />;
    case "Error":
      return <ErrorDisplay />;
    default:
      return <ButtonDisplay />;
  }
}

export default App;
