import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type HaveNeedPanelProps = {
  title: string;
  items: string[];
  variant: "have" | "need";
};

export function HaveNeedPanel({
  title,
  items,
  variant,
}: HaveNeedPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>
          {variant === "have"
            ? "Already on the shelf."
            : "Worth grabbing nearby."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant={variant}>
            {item}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}
