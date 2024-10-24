"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Abi,
  type AbiFunction,
  formatEther,
  type TransactionReceipt as ViemTransactionReceipt,
} from "viem";
import {
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { SearchInput } from "~/components/ui/search-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface ContractFunctionsProps {
  abi: Abi;
  address: `0x${string}`;
}

export function ContractFunctions({ abi, address }: ContractFunctionsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReadFunctions = abi.filter(
    (item): item is AbiFunction =>
      item.type === "function" &&
      item.stateMutability === "view" &&
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWriteFunctions = abi.filter(
    (item): item is AbiFunction =>
      item.type === "function" &&
      (item.stateMutability === "payable" ||
        item.stateMutability === "nonpayable") &&
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedWriteFunctions = filteredWriteFunctions.reduce(
    (acc, func) => {
      if (!func.name) return acc;
      const key = `${func.name}(${func?.inputs?.map((input) => input.type).join(",")})`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(func);
      return acc;
    },
    {} as { [key: string]: AbiFunction[] }
  );

  return (
    <div className="space-y-6">
      <SearchInput
        placeholder="Search functions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Tabs defaultValue="read">
        <TabsList>
          <TabsTrigger value="read">
            Read ({filteredReadFunctions.length})
          </TabsTrigger>
          <TabsTrigger value="write">
            Write ({Object.keys(groupedWriteFunctions).length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="read">
          {filteredReadFunctions.length > 0 ? (
            <div className="mt-4 space-y-4">
              {filteredReadFunctions.map((func) => (
                <ReadFunction
                  key={func.name}
                  address={address}
                  functionAbi={func}
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              No read functions found.
            </p>
          )}
        </TabsContent>
        <TabsContent value="write">
          {Object.keys(groupedWriteFunctions).length > 0 ? (
            <div className="mt-4 space-y-4">
              {Object.values(groupedWriteFunctions)
                .flat()
                .map((func, index) => (
                  <WriteFunction
                    key={`${func.name}-${index}`}
                    address={address}
                    functionAbi={func}
                  />
                ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              No write functions found.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ReadFunctionProps {
  address: `0x${string}`;
  functionAbi: AbiFunction;
}

function ReadFunction({ address, functionAbi }: ReadFunctionProps) {
  const [args, setArgs] = useState<unknown[]>(functionAbi.inputs.map(() => ""));
  const [result, setResult] = useState<unknown>(null);

  const { refetch, isLoading } = useReadContract({
    address,
    abi: [functionAbi],
    functionName: functionAbi.name,
    args,
  });

  const handleChange = (value: string, index: number) => {
    const newArgs = [...args];
    newArgs[index] = value;
    setArgs(newArgs);
  };

  const handleRead = async () => {
    try {
      const { data } = await refetch();
      setResult(data);
      toast.success("Read Successful");
    } catch (error) {
      toast.error("Read Failed", {
        description: (error as Error).message,
      });
    }
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={functionAbi.name}>
        <AccordionTrigger>{functionAbi.name}</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              {functionAbi.inputs.map((input, index) => (
                <div key={input.name} className="flex items-center space-x-2">
                  <Label
                    htmlFor={`${functionAbi.name}-${input.name}`}
                    className="w-1/4"
                  >
                    {input.name}
                  </Label>
                  <Input
                    id={`${functionAbi.name}-${input.name}`}
                    value={args[index] as string}
                    onChange={(e) => handleChange(e.target.value, index)}
                    placeholder={`Enter ${input.type}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleRead} size="sm" className="w-32">
                {isLoading ? "Reading..." : "Read"}
              </Button>
              {result !== null && (
                <Input
                  value={serializeResult(result)}
                  readOnly
                  className="flex-1"
                />
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function serializeResult(result: unknown): string {
  if (result === null || result === undefined) return "";
  if (typeof result === "bigint") return result.toString();
  if (Array.isArray(result)) {
    return "[" + result.map(serializeResult).join(", ") + "]";
  }
  if (typeof result === "object") {
    return JSON.stringify(result, (_, v) =>
      typeof v === "bigint" ? v.toString() : (v as unknown)
    );
  }
  return String(result);
}

interface WriteFunctionProps {
  address: `0x${string}`;
  functionAbi: AbiFunction;
}

function WriteFunction({ address, functionAbi }: WriteFunctionProps) {
  const [args, setArgs] = useState<unknown[]>(functionAbi.inputs.map(() => ""));
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | null>(
    null
  );

  const { data: simulateData, refetch: simulateRefetch } = useSimulateContract({
    address,
    abi: [functionAbi],
    functionName: functionAbi.name,
    args,
  });

  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const { isLoading: isWaiting, data: receipt } = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}`,
    query: {
      enabled: !!transactionHash,
    },
  });

  const handleChange = (value: string, index: number) => {
    const newArgs = [...args];
    newArgs[index] = value;
    setArgs(newArgs);
  };

  const handleWrite = async () => {
    try {
      await simulateRefetch();
      if (simulateData?.request) {
        const hash = await writeContractAsync(simulateData.request);
        setTransactionHash(hash);
        toast.success("Transaction Sent");
      }
    } catch (error) {
      toast.error("Write Failed", {
        description: (error as Error).message,
      });
    }
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value={`${functionAbi.name}(${functionAbi.inputs.map((input) => input.type).join(",")})`}
      >
        <AccordionTrigger>
          {functionAbi.name}(
          {functionAbi.inputs.map((input) => input.type).join(", ")})
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              {functionAbi.inputs.map((input, index) => (
                <div key={input.name} className="flex items-center space-x-2">
                  <Label
                    htmlFor={`${functionAbi.name}-${input.name}`}
                    className="w-1/4"
                  >
                    {input.name}
                  </Label>
                  <Input
                    id={`${functionAbi.name}-${input.name}`}
                    value={args[index] as string}
                    onChange={(e) => handleChange(e.target.value, index)}
                    placeholder={`Enter ${input.type}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={handleWrite}
              size="sm"
              className="w-32"
              disabled={isWriting || isWaiting}
            >
              {isWriting ? "Writing..." : isWaiting ? "Waiting..." : "Write"}
            </Button>
            {transactionHash && (
              <div className="mt-4 rounded-md bg-gray-100 p-4">
                <p className="font-medium">Transaction Hash:</p>
                <p className="text-sm break-all">{transactionHash}</p>
                <TransactionReceipt receipt={receipt} isLoading={isWaiting} />
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

interface TransactionReceiptProps {
  receipt: ViemTransactionReceipt | undefined;
  isLoading: boolean;
}

function TransactionReceipt({ receipt, isLoading }: TransactionReceiptProps) {
  if (isLoading) {
    return <p className="text-sm text-gray-500">Waiting for receipt...</p>;
  }

  if (!receipt) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2 text-sm">
      <p>
        <strong>Status:</strong>{" "}
        {receipt.status === "success" ? "Success" : "Failed"}
      </p>
      <p>
        <strong>Block Number:</strong> {receipt.blockNumber}
      </p>
      <p>
        <strong>Gas Used:</strong> {receipt.gasUsed.toString()}
      </p>
      <p>
        <strong>Effective Gas Price:</strong>{" "}
        {formatEther(receipt.effectiveGasPrice)} ETH
      </p>
      <p>
        <strong>Transaction Index:</strong> {receipt.transactionIndex}
      </p>
    </div>
  );
}
