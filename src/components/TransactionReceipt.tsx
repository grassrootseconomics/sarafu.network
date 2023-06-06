import { Box, Divider, List, ListItem, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { TransactionReceipt } from "viem";
import { useWaitForTransaction } from "wagmi";

export function Transaction({ hash }: { hash: `0x${string}` }) {
  const { data, isError, isLoading } = useWaitForTransaction({
    hash: hash,
  });

  if (isLoading) return <div>Processing…</div>;
  if (isError) return <div>Transaction error</div>;
  return <TransactionReceiptDisplay receipt={data} />;
}

export const TransactionReceiptDisplay = ({
  receipt,
}: {
  receipt: TransactionReceipt | undefined;
}) => {
  const [showMore, setShowMore] = useState(false);
  if (!receipt) {
    return <Typography>No Transaction Receipt Available</Typography>;
  }
  const toggleShowMore = () => setShowMore(!showMore);
  if (!showMore) {
    return (
      <Stack
        direction="row"
        flexWrap={"wrap"}
        spacing={2}
        onClick={toggleShowMore}
      >
        <Typography variant="body1">
          Tx Hash: {receipt.transactionHash}
        </Typography>
        <Typography variant="body1">Status: {receipt.status}</Typography>
      </Stack>
    );
  }
  return (
    <Box onClick={toggleShowMore}>
      <Typography variant="h6">Transaction Receipt</Typography>
      <List component="nav">
        <ListItem>
          <Typography variant="body1">
            Block Hash: {receipt.blockHash}
          </Typography>
        </ListItem>
        <Divider />
        <ListItem>
          <Typography variant="body1">
            Block Number: {receipt.blockNumber.toString()}
          </Typography>
        </ListItem>
        <Divider />
        <ListItem>
          <Typography variant="body1">
            Contract Address: {receipt.contractAddress}
          </Typography>
        </ListItem>
        <Divider />
        <ListItem>
          <Typography variant="body1">
            Cumulative Gas Used: {receipt.cumulativeGasUsed.toString()}
          </Typography>
        </ListItem>
        <Divider />
        <ListItem>
          <Typography variant="body1">
            Effective Gas Price: {receipt.effectiveGasPrice.toString()}
          </Typography>
        </ListItem>
        <Divider />
        <ListItem>
          <Typography variant="body1">From: {receipt.from}</Typography>
        </ListItem>
        <Divider />
        <ListItem>
          <Typography variant="body1">
            Gas Used: {receipt.gasUsed.toString()}
          </Typography>
        </ListItem>
        <Divider />
        {receipt.logs.map((log, index) => (
          <>
            <ListItem key={index}>
              <Typography variant="body1">Log #{index + 1}:</Typography>
              <Typography variant="body2">Address: {log.address}</Typography>
              <Typography variant="body2">
                Block Hash: {log.blockHash}
              </Typography>
              <Typography variant="body2">
                Block Number: {log?.blockNumber?.toString()}
              </Typography>
              <Typography style={{ wordBreak: "break-all" }} variant="body2">
                Data: {log.data}
              </Typography>
              <Typography variant="body2">Log Index: {log.logIndex}</Typography>
              <Typography variant="body2">
                Transaction Hash: {log.transactionHash}
              </Typography>
              <Typography variant="body2">
                Transaction Index: {log.transactionIndex}
              </Typography>
              <Typography variant="body2">Removed: {log.removed}</Typography>
              <Typography variant="body2" style={{ wordWrap: "break-word" }}>
                Topics: {log.topics.join(", ")}
              </Typography>
            </ListItem>
            <Divider />
          </>
        ))}
        <ListItem>
          <Typography variant="body1">
            Logs Bloom: {receipt.logsBloom}
          </Typography>
        </ListItem>
        <Divider />
        <ListItem>
          <Typography variant="body1">Status: {receipt.status}</Typography>
        </ListItem>
        <Divider />
        <ListItem>
          <Typography variant="body1">To: {receipt.to}</Typography>
        </ListItem>
        <Divider />
        <ListItem>
          <Typography variant="body1">
            Transaction Hash: {receipt.transactionHash}
          </Typography>
        </ListItem>
        <Divider />
        <ListItem>
          <Typography variant="body1">
            Transaction Index: {receipt.transactionIndex}
          </Typography>
        </ListItem>
        <Divider />
        <ListItem>
          <Typography variant="body1">Type: {receipt.type}</Typography>
        </ListItem>
      </List>
    </Box>
  );
};

export default TransactionReceiptDisplay;
