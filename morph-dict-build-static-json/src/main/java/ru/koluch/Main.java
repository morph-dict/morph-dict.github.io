/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 * <p/>
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 * <p/>
 * Created: 04.12.2015 20:34
 */
package ru.koluch;

import java.io.*;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.sun.deploy.panel.TreeBuilder;
import org.apache.commons.io.FileUtils;
import ru.koluch.morphDict.dictionary.DictionaryHelper;
import ru.koluch.morphDict.dictionary.data.Dictionary;
import ru.koluch.morphDict.dictionary.data.LexemeRec;
import ru.koluch.morphDict.dictionary.data.ParadigmRule;
import ru.koluch.morphDict.lookup.LookupService;
import ru.koluch.morphDict.lookup.PrefixTreeLookupService;
import ru.koluch.morphDict.prefixTree.PrefixTree;
import ru.koluch.morphDict.prefixTree.Statistics;

public class Main {

    /**
     * @param args
     */
    public static void main(String[] args) throws IOException, DictionaryHelper.ParseException {


        final Dictionary dictionary = DictionaryHelper.parse();
        PrefixTree<DictionaryHelper.TreeData> prefixTree = DictionaryHelper.buildPrefixTree(dictionary);

        System.out.println("Nodes: " + Statistics.countNodes(prefixTree));
        System.out.println("Leafs: " + Statistics.countLeafs(prefixTree));
        System.out.println("Max deep: " + Statistics.countMaxDeep(prefixTree));

        File parentDir = new File("data");
        if(parentDir.isDirectory()) FileUtils.deleteDirectory(parentDir);

        JsonFilesBuilder jsonFilesBuilder = new JsonFilesBuilder();

        jsonFilesBuilder.build(parentDir, dictionary, prefixTree, (data) -> {
            JsonArray json = new JsonArray();
            for (DictionaryHelper.TreeData treeData : data) {
                JsonArray sub = new JsonArray();

                LexemeRec lexemeRec = dictionary.lexemeRecs.get(treeData.lexemeRecIndex);
                List<ParadigmRule> paradigmRules = dictionary.paradigmList.get(lexemeRec.paradigmIndex);
                ParadigmRule paradigmRule = paradigmRules.get(treeData.paradigmRuleIndex);

                sub.add(paradigmRule.ancode);
                sub.add(treeData.lexemeRecIndex);
                json.add(sub);
            }
            return json;
        });

        System.out.println("Finished!");
    }

}
