/**
 * --------------------------------------------------------------------
 * Copyright 2015 Nikolay Mavrenkov
 * <p/>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p/>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p/>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * --------------------------------------------------------------------
 * <p/>
 * Author:  Nikolay Mavrenkov <koluch@koluch.ru>
 * Created: 31.10.2015 21:54
 */
package ru.koluch;


import com.google.gson.*;
import com.google.gson.stream.JsonWriter;
import ru.koluch.morphDict.dictionary.data.Dictionary;
import ru.koluch.morphDict.dictionary.data.LexemeRec;
import ru.koluch.morphDict.dictionary.data.ParadigmRule;
import ru.koluch.morphDict.prefixTree.PrefixTree;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.function.Function;

public class JsonFilesBuilder {


    public static final int TREE_ITEMS_PER_FILE = 500;
    public static final int DICT_LEX_ITEMS_PER_FILE = 250;
    public static final int DICT_PARADIGM_ITEMS_PER_FILE = 10;
    public static final int DICT_PREFIX_ITEMS_PER_FILE = 500;

    public <T> void build(File parentDir, Dictionary dict, PrefixTree<T> tree, Function<List<T>, JsonElement> dataSerializer) throws IOException {

        parentDir.mkdir();

        // Write tree
        File treeDir = new File(parentDir, "tree"); treeDir.mkdir();
        int root;
        try(JsonArrayWriter treeJsonWriter = new JsonArrayWriter(TREE_ITEMS_PER_FILE, treeDir)) {
            root = writeTree(treeJsonWriter, tree, dataSerializer);
        }

        // Write dictionary
        File dictLexDir = new File(parentDir, "dict_lexs"); dictLexDir.mkdir();
        File dictParadigmDir = new File(parentDir, "dict_paradigms"); dictParadigmDir.mkdir();
        File dictPrefixDir = new File(parentDir, "dict_prefixes"); dictPrefixDir.mkdir();
        try(
            JsonArrayWriter lexRecsWriter = new JsonArrayWriter(DICT_LEX_ITEMS_PER_FILE, dictLexDir);
            JsonArrayWriter paradigmsRecsWriter = new JsonArrayWriter(DICT_PARADIGM_ITEMS_PER_FILE, dictParadigmDir);
            JsonArrayWriter prefixesWriter = new JsonArrayWriter(DICT_PREFIX_ITEMS_PER_FILE, dictPrefixDir)
        ) {
            writeDict(lexRecsWriter, paradigmsRecsWriter, prefixesWriter, dict);
        }

        // Write index file
        try(BufferedWriter writer = new BufferedWriter(new FileWriter(new File(parentDir, "index.json")))) {
            JsonObject indexJson = new JsonObject();
            indexJson.add("root", new JsonPrimitive(root));
            indexJson.add("treeItemsPerFile", new JsonPrimitive(TREE_ITEMS_PER_FILE));
            indexJson.add("dictLexItemsPerFile", new JsonPrimitive(DICT_LEX_ITEMS_PER_FILE));
            indexJson.add("dictParadigmItemsPerFile", new JsonPrimitive(DICT_PARADIGM_ITEMS_PER_FILE));
            indexJson.add("dictPrefixItemsPerFile", new JsonPrimitive(DICT_PREFIX_ITEMS_PER_FILE));
            indexJson.add("treeDir", new JsonPrimitive(treeDir.getName()));
            indexJson.add("dictLexDir", new JsonPrimitive(dictLexDir.getName()));
            indexJson.add("dictParadigmDir", new JsonPrimitive(dictParadigmDir.getName()));
            indexJson.add("dictPrefixDir", new JsonPrimitive(dictPrefixDir.getName()));
            GsonBuilder gsonBuilder = new GsonBuilder();
            gsonBuilder.setPrettyPrinting();
            Gson gson = gsonBuilder.create();
            writer.write(gson.toJson(indexJson));
        }
    }

    private  <T> int writeTree(JsonArrayWriter jsonArrayWriter, PrefixTree<T> tree, Function<List<T>, JsonElement> dataSerializer) throws IOException {
        JsonArray node = new JsonArray();
        JsonObject branches = new JsonObject();

        if(tree.branches != null) {
            for (int i = 0; i < tree.branches.length; i++) {
                PrefixTree<T> branch = tree.branches[i];
                if(branch!=null) {
                    int index = writeTree(jsonArrayWriter, branch, dataSerializer);
                    char br;
                    char iCh = (char) ('а' + i);
                    if(iCh >= 'а' && iCh <= 'е') {
                        br = iCh;
                    }
                    else if(iCh == 'е' + 1) {
                        br = 'ё';
                    }
                    else {
                        br = (char) (iCh-1);
                    }

                    branches.add(String.valueOf(br), new JsonPrimitive(index));
                }
            }
        }
        node.add(branches);
        if(tree.data!=null) {
            node.add(dataSerializer.apply(tree.data));
        }
        int index = jsonArrayWriter.write(node);
        return index;
    }

    private void writeDict(JsonArrayWriter dictWriter, JsonArrayWriter paradigmsWriter, JsonArrayWriter prefixesWriter, Dictionary dict) throws IOException {

        for (List<ParadigmRule> paradigm : dict.paradigmList) {
            JsonArray rulesJson = new JsonArray();
            for (ParadigmRule paradigmRule : paradigm) {
                JsonArray ruleJson = new JsonArray();
                ruleJson.add(paradigmRule.ending.<JsonElement>map(JsonPrimitive::new).orElse(JsonNull.INSTANCE));
                ruleJson.add(paradigmRule.ancode);
                ruleJson.add(paradigmRule.prefix.<JsonElement>map(JsonPrimitive::new).orElse(JsonNull.INSTANCE));
                rulesJson.add(ruleJson);
            }
            paradigmsWriter.write(rulesJson);
        }

        for (LexemeRec lexemeRec : dict.lexemeRecs) {
            JsonArray lexemeRecJson = new JsonArray();
            lexemeRecJson.add(lexemeRec.basis);
            lexemeRecJson.add(lexemeRec.paradigmIndex);
            lexemeRecJson.add(lexemeRec.accentParadigmIndex);
            lexemeRecJson.add(lexemeRec.userSessionIndex);
            lexemeRecJson.add(lexemeRec.ancode.<JsonElement>map(JsonPrimitive::new).orElse(JsonNull.INSTANCE));
            lexemeRecJson.add(lexemeRec.prefixParadigmIndex.<JsonElement>map(JsonPrimitive::new).orElse(JsonNull.INSTANCE));
            dictWriter.write(lexemeRecJson);
        }

        for (String prefix : dict.prefixeParadigmList) {
            prefixesWriter.write(new JsonPrimitive(prefix));
        }
    }

    private static class JsonArrayWriter implements AutoCloseable {
        private final Gson gson = new Gson();
        private int counter = 0;
        private final int itemsPerFile;
        private File dir;
        JsonWriter jsonWriter;

        public JsonArrayWriter(int itemsPerFile, File dir) throws IOException {
            this.itemsPerFile = itemsPerFile;
            this.dir = dir;
        }

        public int write(JsonElement json) throws IOException {
            if(counter % itemsPerFile == 0) {
                if(jsonWriter!=null) {
                    jsonWriter.endArray();
                    jsonWriter.close();
                }
                String fileName = (counter / itemsPerFile) + ".json";
                jsonWriter = new JsonWriter(new FileWriter(new File(dir, fileName)));
                jsonWriter.beginArray();
            }

            jsonWriter.jsonValue(gson.toJson(json));
            return counter++;
        }


        @Override
        public void close() throws IOException {
            if(jsonWriter!=null) {
                jsonWriter.endArray();
                jsonWriter.close();
            }
        }
    }


}
