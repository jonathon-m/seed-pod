'use client'

import {
  login,
  logout,
  handleIncomingRedirect,
} from "@inrupt/solid-client-authn-browser";


import { useEffect } from "react";
import ResourceView from "@/components/resourceView/resourceView";
import { useQuery } from "@tanstack/react-query";
import { getPods, getWebId } from "@/solid/queries";

const SELECTED_IDP = "https://login.inrupt.com/"

export default function Home() {


  const { data: webId, refetch } = useQuery({ queryKey: ['webId'], queryFn: getWebId })

  const { data: pods } = useQuery({ 
    queryKey: ['pods', webId],
    queryFn: ({queryKey}) => getPods(queryKey[1] as string),
    enabled: !!webId
  })


  useEffect(() => {
    if (window != undefined) {
      handleRedirectAfterLogin()
    }
  }, [])

  async function loginToSelectedIdP() {
    return login({
      oidcIssuer: SELECTED_IDP,
      redirectUrl: new URL("/", window.location.href).toString(),
      clientName: "SeedPod",
    });
  }

  async function handleLogout(){
    await logout({logoutType: 'app'});
    refetch()
  }

  async function handleRedirectAfterLogin() {
    await handleIncomingRedirect(); // no-op if not part of login redirect
    refetch()
  }


  return (
    <main className="min-h-screen max-h-screen font-mono text-sm">
        

      <div className="w-screen bg-gray-500 flex flex-row place-content-center gap-4 p-2 pl-4 pr-4">
        <div className='flex flex-grow gap-4'>
        <span className="inline-flex items-baseline w-4">
          <img className="invert" src="seedpod.svg"/>
        </span>
          { pods && pods.length > 0 && pods[0] }
          </div>
        { webId ? < >
          <div className="flex">{webId.split('/').pop()}</div>
          |
          <button className="flex flex-row hover:text-gray-600 underline" onClick={() => handleLogout()}>Logout</button>
          
          </>
                  :
          <button className="flex flex-row hover:text-gray-600 underline" onClick={() => loginToSelectedIdP()}>Login</button>
          }
      </div>
      
      <div className="flex grow w-full h-[calc(100vh-2.5rem)]">
          { pods && pods.length > 0 ? 
            <ResourceView pod={pods[0]}/> : 
            <div className="m-4 w-full text-center mt-[30vh]">
                <button className="hover:text-gray-600 underline" onClick={() => loginToSelectedIdP()}>Login</button> to see your pod
            </div>}
    </div>
    </main>
  );
}
