import { useState } from "react";
import Resource from "../resource/resource";
import Actions from "../actions/actions";
import { useQuery } from "@tanstack/react-query";
import { getFileContents } from "@/solid/queries";


interface ResourceViewProps {
    pod: string
}

export default function ResourceView({ pod }: ResourceViewProps) {

    const [selectedFile, setSelectedFile] = useState<string | undefined>(pod)

    const { data: fileData, isError, isFetching } = useQuery({ 
        queryKey: ['file', selectedFile],
        queryFn: ({queryKey}) => getFileContents(queryKey[1] as string),
        enabled: !!selectedFile && selectedFile != pod,
        initialData: ""
      })

    return (<>
            <div className="flex flex-col bg-gray-600 min-w-80">
                <div className="border-b-2 mb-2 p-2">
                    <Actions url={selectedFile}/>
                </div>
                <ul className="max-h-40 md:max-h-[unset] overflow-auto scrollbar scrollbar-track-gray-600 scrollbar-thumb-gray-200">
                    <li key={pod}>
                    <Resource 
                    url={pod} 
                    prefix='' 
                    isRoot={true}
                    setFile={setSelectedFile} 
                    selectedFile={selectedFile}/>
                    </li>
                </ul>
            </div>
            <div className="flex flex-col grow overflow-hidden">
                {selectedFile && 
                    <>
                        <div className="p-2 pl-4 bg-gray-700">{selectedFile.replace(pod, '')}</div>
                        <div className="p-4 overflow-auto">
                            <pre className="text-wrap break-all" >
                                {!isFetching && (isError ? 'Could not retrieve file contents...' : fileData)}
                                {isFetching && <span className="animate-bounce">Loading..<span className="animate-blink">.</span></span>}
                            </pre>
                        </div>
                    </>
                }
            </div>
            
        </>
    )

}
