'use client';
import Image from "next/image";
import { useState } from "react";

export default function Home() {

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [url, setUrl] = useState('');

  const isValidDocUrl = (url: string) => {
    const isNormal = /^https?:\/\/(?:[-\w.]|(?:%[\da-fA-F]{2}))+/.test(url);
    const isFeishuDocs = url.includes('feishu.cn/docx/');
    const isLarkDocs = url.includes('larksuite.com/docx/');
    return isNormal && (isFeishuDocs || isLarkDocs);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setUrl(url);
    if (!url) {
      return;
    }
    try {
      new URL(url);
    } catch {
      setResult('Not a valid URL, please check again.');
      return;
    }
    const isValidDoc = isValidDocUrl(url)
    if (!isValidDoc) {
      setResult('Invalid document url, please check again.');
    }
    setDisabled(!isValidDoc);
  }





  const polling = (executor: Function) => {
    let timeout = 1000;
    const maxTry = 15;
    let count = 0;
    return new Promise((resolve, reject) => {
      const fn = () => {
        console.log("polling ", timeout)
        setTimeout(async () => {
          try {
            const isDone = await executor();
            console.log("isDone", isDone)
            if (!isDone) {
              timeout = Math.floor(timeout * 1.2);
              count++;
              if (count > maxTry) {
                reject("Task timeout, try again");
              }
              fn();
            } else {
              resolve("");
            }
          } catch (err) {
            reject("Unexpected server error");
          }
        }, timeout)
      }
      fn();
    })
  }

  const handleSubmit = async function (e: React.MouseEvent) {
    if (loading || disabled) {
      return;
    }

    setLoading(true);
    setResult('Task submit! Wait a few seconds.')

    const urlObj = new URL(url);
    const fullUrl = urlObj.origin + urlObj.pathname;

    const waitTaskDone = async () => {
      const response = await fetch(`https://larkdocs2md.chanx.tech/api/export?url=${fullUrl}`);
      const body = await response.json();
      if (body.status === 1) {
        const link = `https://larkdocs2md.chanx.tech/api/download?url=${fullUrl}`;
        window.open(link, '_blank');
        setResult(`Task Success(${fullUrl})! <br /> Download link: <a href="${link}" target="_blank" class="font-semibold underline">Click</a>`)
        setUrl('');
        return true;
      } else if (body.status === -1) {
        setResult(`Task Fail! You can try later.`)
        return true;
      }
      return false;
    }
    try {
      await polling(waitTaskDone)
    } catch (err) {
      setResult((err as string).toString());
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-[100vh] w-[100vw] flex flex-col overflow-hidden">
      <header className="flex justify-between items-center px-10 py-4 bg-[#fafafa] select-none border-b">
        <div className="flex gap-4 justify-center items-center">
          <Image src={'/logo.svg'} alt="logo" width={32} height={32} draggable="false" />
          <div className="text-xl  font-bold font-mono">Larkdocs2md</div>
        </div>
        <div className="flex justify-center items-center">
          <a href="https://github.com/ischanx/larkdocs2md" target="_blank"><Image src={'/github.svg'} alt="github" width={28} height={28} draggable="false" /></a>
        </div>
      </header>
      <main className="flex justify-center p-10 md:px-20 w-full flex-grow bg-[#ffffff]">
        <div className="flex flex-col gap-6  mt-24 justify-between">
          <div className="flex flex-col gap-6 items-center">
            <div className="flex flex-col text-center gap-4 font-semibold">
              <div className="text-3xl font-bold w-full">
                10s! Export .md file from the Feishu/Lark Document
              </div>

              <div className="text-opacity-60 text-black">
                Export the target Lark/feishu document as markdown file by a url
              </div>
            </div>

            <input
              value={url}
              placeholder="Paste the public sharing URL of your target document..."
              onChange={handleInputChange}
              className="mt-4 w-[80vw] max-w-[600px] text-center px-8 py-4 border rounded-xl transition-all ease-in-out hover:outline-[#2c4ea461] hover:outline focus:outline focus:outline-[#2c4ea4d7]"
            />
            <button
              onClick={handleSubmit}
              disabled={disabled || loading}
              className={`w-[80vw] max-w-[600px] px-8 py-4  bg-[#3e70e5] transition-colors rounded-full text-white text-xl ${disabled ? 'opacity-30 cursor-not-allowed' : ' hover:bg-opacity-95 active:bg-opacity-85'}`}
            >
              {loading ? 'Loading...' : 'Go'}
            </button>
            <div dangerouslySetInnerHTML={{ __html: result }} className="w-[80vw] max-w-[600px] text-center font-semibold text-black text-opacity-80 text-xl break-all"></div>
          </div>

          <div className="flex flex-col gap-4 my-4 w-fit max-w-[800px] xl:max-w-[1200px]">
            <div className="font-bold text-2xl">Q&A</div>

            <div className="flex flex-col gap-2">
              <div className="font-semibold text-xl">#0 How to use</div>
              <div className="flex flex-col gap-1 text px-2">
                <div>- Set the permission of the document as 「Anyone can view」</div>
                <div>- Copy the open sharing url and paste it into the input</div>
                <div>- Revoke the permission change if your document is secret</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-semibold text-xl">#1 Introduction</div>
              <div className="text px-2">
                I get used to write a blog on the Feishu, but i find no entry for the export a markdown file. So i try to make a tool for myself and share it to others.
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-semibold text-xl">#2 How does it work?</div>
              <div className="text px-2">
                This project based on the official open api (<a href="https://open.feishu.cn/" className="font-bold text-blue-500 underline">Feishu</a>/<a href="https://open.larksuite.com/" className="font-bold text-blue-500 underline">Lark</a>).
                It will generate a markdown file by getting the data from the api.
                After transform completed, you can download the .zip contains markdown file.
              </div>
            </div>



            <div className="flex flex-col gap-2">
              <div className="font-semibold text-xl">#3 Other</div>
              <div className="flex flex-col gap-1 text px-2">
                <div>- Any feedback about this, contact me by the <a href="mailto:ischanx8@gmail.com" className="font-bold text-blue-500 underline">email</a> (ischanx8@gmail.com).</div>
                <div>- Support me by <a href="https://github.com/ischanx/larkdocs2md" className="font-bold text-blue-500 underline">star my Github</a> or send an feedback email.</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full py-6 bg-[#fafafa] border-t flex justify-center items-center text-sm">
        <div>Powered by <a href="https://chanx.tech/about/">ischanx</a></div>
      </footer>
    </div>
  );
}
