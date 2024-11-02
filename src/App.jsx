/* eslint-disable no-console */
import { create } from 'ipfs-http-client';
import React, { useState, useEffect } from 'react';


const Connect = ({ setIpfs }) => {
  const [multiaddr, setMultiaddr] = useState('/ip4/127.0.0.1/tcp/5001');
  const [error, setError] = useState(null);

  const connect = async (e) => {
    try {
      const http = create(multiaddr);
      const isOnline = await http.isOnline();

      if (isOnline) {
        setIpfs(http);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <label htmlFor="connect-input" className="block text-gray-700 text-sm font-bold mb-2">Address</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
          id="connect-input"
          name="connect-input"
          type="text"
          required
          value={multiaddr}
          onChange={(e) => setMultiaddr(e.target.value)}
        />

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:shadow-outline"
          id="connect-submit"
          type="submit" onClick={connect}>Connect
        </button>
      </form>

      {error && (
        <div className="bg-red-500 text-white text-center p-4 rounded mb-4">
          Error: {error.message || error}
        </div>
      )}
    </>
  );
};

const SaveFile = ({ ipfs }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [fileHash, setFileHash] = useState(null);
  const [error, setError] = useState(null);

  const captureFile = (event) => {
    event.stopPropagation();
    event.preventDefault();

    isChecked ? saveToIpfsWithFilename(event.target.files) : saveToIpfs(event.target.files);
  };

  const saveToIpfs = async ([file]) => {
    try {
      const added = await ipfs.add(file, { progress: (prog) => console.log(`received: ${prog}`) });
      setFileHash(added.cid.toString());
    } catch (err) {
      setError(err.message);
    }
  };

  const saveToIpfsWithFilename = async ([file]) => {
    const fileDetails = { path: file.name, content: file };
    const options = { wrapWithDirectory: true, progress: (prog) => console.log(`received: ${prog}`) };

    try {
      const added = await ipfs.add(fileDetails, options);
      setFileHash(added.cid.toString());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <form id='capture-media' onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <label htmlFor="input-file" className="block text-gray-700 text-sm font-bold mb-2">Input File</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
          id="input-file"
          name="input-file"
          type="file"
          onChange={captureFile}
        />
        
        <div className="flex items-center mb-4">
          <input className="mr-2" type="checkbox" id="keep-filename" name="keep-filename" checked={isChecked}
            onChange={() => setIsChecked(!isChecked)} />
          <label htmlFor="keep-filename" className="text-gray-700">Keep Filename</label>
        </div>
      </form>

      {fileHash && (
        <div className="bg-green-500 text-white text-center p-4 rounded mb-4">
          <a target='_blank' href={'https://ipfs.io/ipfs/' + fileHash} className="underline">
            {fileHash}
          </a>
        </div>
      )}

      {error && (
        <div className="bg-red-500 text-white text-center p-4 rounded mb-4">
          Error: {error.message || error}
        </div>
      )}
    </>
  );
};

const Details = ({ keys, obj }) => {
  if (!obj || !keys || keys.length === 0) return null;
  return (
    <>
      {keys?.map((key) => (
        <div className='mb-4' key={key}>
          <h2 className='text-gray-700 font-bold'>{key}</h2>
          <div className='bg-gray-100 p-2 rounded truncate monospace'>{obj[key].toString()}</div>
        </div>
      ))}
    </>
  );
};

const App = () => {
  const [ipfs, setIpfs] = useState(null);
  const [version, setVersion] = useState(null);
  const [id, setId] = useState(null);

  useEffect(() => {
    if (!ipfs) return;

    const getVersion = async () => {
      const nodeId = await ipfs.version();
      setVersion(nodeId);
    };

    const getId = async () => {
      const nodeId = await ipfs.id();
      setId(nodeId);
    };

    getVersion();
    getId();
  }, [ipfs]);

  return (
    <>
      <header className="flex center items-center justify-center p-4 bg-blue-800 text-white">
        <a href="https://ipfs.io" title="home" className="text-xl font-bold">IPFS File Upload</a>
      </header>

      <main className="p-8 bg-gray-50 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">HTTP Client Upload File</h1>

        <Connect setIpfs={setIpfs} />
        <br />
        {ipfs && (
          <>
            {(id || version) && (
              <>
                <h1 className='text-2xl font-bold text-center text-blue-800 mb-4'>Connected to IPFS</h1>
                <div>
                  {id && <Details obj={id} keys={['id', 'agentVersion']} />}
                  {version && <Details obj={version} keys={['version']} />}
                </div>
              </>
            )}

            <SaveFile ipfs={ipfs} />
          </>
        )}
      </main>
    </>
  );
};

export default App;
