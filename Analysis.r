mydata <- Mindfulness_and_signal_detection_September_9_2018_14_47

new_set = NULL

# Loop over all of the rows
for(row in 1:nrow(mydata)) {
  # check if the progress is 100
  if (mydata[row, "Progress"]$Progress == 100) {
    # completed the study
    
    # calculate sms
    sms_mean = NA
    # calculate maas mean (MAAS_1 to MAAS_15) 
    # Almost Always = 1
    # Very Frequently = 2
    # Somewhat Frequently = 3
    # Somewhat Infrequently = 4
    # Very Infrequently = 5
    # Almost Never = 6
    convertMAAS <- function(string) {
      val = NULL
      if (is.na(string)) {
        val = 0
      } else if (string == "Almost Always") {
        val = 1
      } else if (string == "Very Frequently") {
        val = 2
      } else if (string == "Somewhat Frequently") {
        val = 3
      } else if (string == "Somewhat Inrequently") {
        val = 4
      } else if (string == "Very Infrequently") {
        val = 5
      } else if (string == "Almost Never") {
        val = 6
      } else {
        val = 0
      }
      return(val)
    }
    
    maas_mean <- mean(convertMAAS(mydata[row, "MAAS_1"]$MAAS_1),
                 convertMAAS(mydata[row, "MAAS_2"]$MAAS_2),
                 convertMAAS(mydata[row, "MAAS_3"]$MAAS_3),
                 convertMAAS(mydata[row, "MAAS_4"]$MAAS_4),
                 convertMAAS(mydata[row, "MAAS_5"]$MAAS_5),
                 convertMAAS(mydata[row, "MAAS_6"]$MAAS_6),
                 convertMAAS(mydata[row, "MAAS_7"]$MAAS_7),
                 convertMAAS(mydata[row, "MAAS_8"]$MAAS_8),
                 convertMAAS(mydata[row, "MAAS_9"]$MAAS_9),
                 convertMAAS(mydata[row, "MAAS_10"]$MAAS_10),
                 convertMAAS(mydata[row, "MAAS_11"]$MAAS_11),
                 convertMAAS(mydata[row, "MAAS_12"]$MAAS_12),
                 convertMAAS(mydata[row, "MAAS_13"]$MAAS_13),
                 convertMAAS(mydata[row, "MAAS_14"]$MAAS_14),
                 convertMAAS(mydata[row, "MAAS_15"]$MAAS_15))
    
    # iterate through all of the VS trials
    trial_rows = unlist(strsplit(mydata[row, "ResultOfFlanker"]$ResultOfFlanker, "\n"))
    
    for(i in trial_rows) {
      
      #vs_trials[i, ] = c("1")
      comp = unlist(strsplit(i, ","))
      # 1 =  
      # 2 = NA
      # 3 = Keypress
      # 4 = type of expiriment
      # 5 = index
      # 6 = total time elapsed ?
      # 7 =
      # 8 = correctness
      # 9 = target present
      # 10 = reaction time
      
      #print(comp[1])
      #print(comp[7])
      # append to the final data frame
      print(comp[10])
      if (is.na(comp[10])){
        print('bad data')
      }else {
        new_set = rbind(new_set, data.frame("ID"=mydata[row, "ResponseId"]$ResponseId,
                                            "MAAS"=maas_mean,
                                            "SMS"=sms_mean,
                                            "Target Present"=comp[9],
                                            "Correctness"=comp[8],
                                            "Reaction Time"=comp[10]))   
        
      }
    }
  }
}

