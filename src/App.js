import { useEffect, useState } from "react";

function App() {
  const [FlexpaLink, setFlexpaLink] = useState(null);
  const [EOB, setEOB] = useState(null);
  const [display, setDisplay] = useState("Button");

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
      <div className="">
        <pre className="m-10 p-4">{JSON.stringify(EOB, null, 2)}</pre>
      </div>
    );
  };
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

  const fetchEOB = async (accessToken) => {
    const request = await fetch(
      "https://api.flexpa.com/fhir/ExplanationOfBenefit?patient=$PATIENT_ID",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
      }
    );
    const result = await request.json();
    setEOB(result);
    setDisplay("EOB");
  };

  useEffect(() => {
    if (!FlexpaLink) {
      // Global object loading code inspired by this stackoverflow answer
      // https://stackoverflow.com/questions/34424845/adding-script-tag-to-react-jsx
      const script = document.createElement("script");

      script.src = "https://js.flexpa.com/v1/";
      script.async = true;
      script.onload = () => setFlexpaLink(window.FlexpaLink);

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }

    FlexpaLink.create({
      publishableKey: "pk_test_rOLEv70qS8mD9jvAncRzfnf9SFGB80ehZa4upWZYWEc",
      onSuccess: async (publicToken) => {
        setDisplay("Fetch");
        const request = await fetch("https://api.flexpa.com/link/exchange", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            public_token: publicToken,
            secret_key: "sk_test_x4uui0gOhNed29Nax9wOUf0_hZ67AThYxXLEZ9KpJuY",
          }),
        });

        const response = await request.json();
        await fetchEOB(response.access_token);
      },
    });
  });
  switch (display) {
    case "Button":
      return <ButtonDisplay />;
    case "Fetch":
      return <FetchDisplay />;
    case "EOB":
      return <EOBDisplay />;
  }
}

export default App;
