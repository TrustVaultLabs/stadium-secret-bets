import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Shield, Zap } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectProps {
  onConnect: () => void;
}

const WalletConnect = ({ onConnect }: WalletConnectProps) => {
  const { isConnected, address } = useAccount();
  const { toast } = useToast();

  useEffect(() => {
    if (isConnected && address) {
      toast({
        title: "Wallet Connected",
        description: "You're ready to place encrypted bets!",
      });
      onConnect();
    }
  }, [isConnected, address, onConnect, toast]);

  return (
    <Card className="max-w-md mx-auto p-8 card-shadow gradient-scoreboard border-border">
      <div className="text-center mb-6">
        <Wallet className="h-16 w-16 mx-auto mb-4 text-primary stadium-glow animate-glow-pulse" />
        <h3 className="text-2xl font-bold mb-2 scoreboard-text">Connect Wallet</h3>
        <p className="text-muted-foreground">
          Connect your wallet to start placing encrypted bets on sports matches.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
          <Shield className="h-5 w-5 text-accent" />
          <span className="text-sm">Fully encrypted transactions</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-sm">Instant bet placement</span>
        </div>
      </div>

      <div className="flex justify-center">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <Button
                        onClick={openConnectModal}
                        className="w-full gradient-primary text-primary-foreground stadium-glow scoreboard-text font-semibold"
                        size="lg"
                      >
                        <Wallet className="h-5 w-5 mr-2" />
                        Connect Wallet
                      </Button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <Button
                        onClick={openChainModal}
                        className="w-full gradient-primary text-primary-foreground stadium-glow scoreboard-text font-semibold"
                        size="lg"
                      >
                        Wrong network
                      </Button>
                    );
                  }

                  return (
                    <div className="flex gap-2">
                      <Button
                        onClick={openChainModal}
                        className="gradient-primary text-primary-foreground stadium-glow scoreboard-text font-semibold"
                        size="lg"
                      >
                        {chain.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 12,
                              height: 12,
                              borderRadius: 999,
                              overflow: 'hidden',
                              marginRight: 4,
                            }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                style={{ width: 12, height: 12 }}
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </Button>

                      <Button
                        onClick={openAccountModal}
                        className="gradient-primary text-primary-foreground stadium-glow scoreboard-text font-semibold"
                        size="lg"
                      >
                        {account.displayName}
                        {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ''}
                      </Button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </Card>
  );
};

export default WalletConnect;