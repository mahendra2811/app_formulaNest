import { useState } from "react";
import { FlatList, View } from "react-native";
import {
  Button,
  ContentCard,
  Empty,
  Label,
  QueryState,
  Screen,
} from "../src/components/ui";
import { useDatabase } from "../src/hooks/database";
import { useQuery } from "../src/hooks/query";
export default function Revision() {
  const { repo, refresh } = useDatabase();
  const [error, setError] = useState("");
  const [limit,setLimit]=useState(100);
  const q = useQuery(() => repo.collection("revision",{limit}),[limit]);
  const update = async (id: string, status: "learned" | null) => {
    try {
      setError("");
      await repo.revision(id, status);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update revision.");
    }
  };
  return (
    <Screen
      title="Ready for another look"
      subtitle="Your formulas and notes marked for revision."
      scroll={false}
    >
      <QueryState loading={q.loading} error={q.error} retry={q.reload} />
      {!!error && <Label>{error}</Label>}
      {q.data && (
        <FlatList
          data={q.data}
          keyExtractor={(item) => item.id}
          ListFooterComponent={q.data.length===limit&&!q.loading?<Button title="Load more revision items" secondary onPress={()=>setLimit(n=>n+100)}/>:undefined}
          ListEmptyComponent={
            <Empty
              title="No revision items"
              detail="Mark a formula or note for revision while learning."
            />
          }
          renderItem={({ item }) => (
            <View style={{ marginBottom: 18 }}>
              <ContentCard item={item} />
              <Button
                title="Mark learned"
                onPress={() => update(item.id, "learned")}
              />
              <Button
                secondary
                title="Remove from revision"
                onPress={() => update(item.id, null)}
              />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </Screen>
  );
}
