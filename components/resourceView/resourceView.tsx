import { useState } from "react";
import Resource from "../resource/resource";
import Actions from "../actions/actions";
import { useQuery } from "@tanstack/react-query";
import { getFileContents } from "@/solid/queries";


interface ResourceViewProps {
    pod: string
}

export default function ResourceView({ pod }: ResourceViewProps) {

    const [selectedFile, setSelectedFile] = useState<string | undefined>()

    const { data: fileData, isError } = useQuery({ 
        queryKey: ['file', selectedFile],
        queryFn: ({queryKey}) => getFileContents(queryKey[1] as string),
        enabled: !!selectedFile,
        initialData: ""
      })

    return (<>
            <div className="flex flex-col bg-gray-600 min-w-80">
                <div className="border-b-2 mb-2 p-2">
                    <Actions url={selectedFile}/>
                </div>
                <ul className="flex-grow">
                    <li key={pod}>
                    <Resource 
                    url={pod} 
                    prefix='' 
                    isRoot={true}
                    setFile={setSelectedFile} 
                    selectedFile={selectedFile}/>
                    </li>
                </ul>
                <div className="p-2 border-t-2 bg-gray-400">
                   
                </div>
            </div>
            <div className="flex flex-col grow">
                {selectedFile && 
                    <>
                        <div className="p-2 pl-4 bg-gray-700">{selectedFile.replace(pod, '')}</div>
                        <div className="p-4 overflow-auto">
                            <pre className="text-wrap break-all" >
                                {isError ? 'Could not retrieve file contents...' : fileData}
                            </pre>
                        </div>
                    </>
                }
            </div>
            
        </>
    )

}
